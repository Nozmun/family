#!/usr/bin/env python3
"""Quran Agent — a conversational AI agent for exploring the Quran.

Uses the Anthropic SDK with tool use to look up verses, search by topic,
and retrieve surah information via the free alquran.cloud API.

Usage:
    python quran_agent.py
    python quran_agent.py "What does the Quran say about patience?"
"""

import json
import sys

import httpx
import anthropic
from anthropic import beta_tool

QURAN_API = "https://api.alquran.cloud/v1"

client = anthropic.Anthropic()


# ---------------------------------------------------------------------------
# Tools
# ---------------------------------------------------------------------------

@beta_tool
def get_verse(surah: int, ayah: int) -> str:
    """Get a specific Quran verse with Arabic text and English translation (Saheeh International).

    Args:
        surah: The surah (chapter) number, between 1 and 114.
        ayah: The ayah (verse) number within that surah.
    """
    try:
        arabic_resp = httpx.get(f"{QURAN_API}/ayah/{surah}:{ayah}/quran-uthmani", timeout=10)
        english_resp = httpx.get(f"{QURAN_API}/ayah/{surah}:{ayah}/en.sahih", timeout=10)
        arabic_data = arabic_resp.json()
        english_data = english_resp.json()
    except Exception as exc:
        return f"Network error retrieving verse {surah}:{ayah}: {exc}"

    if arabic_data.get("status") != "OK" or english_data.get("status") != "OK":
        return f"Could not retrieve {surah}:{ayah}. Check that the surah and ayah numbers are valid."

    ar = arabic_data["data"]
    en = english_data["data"]
    return json.dumps({
        "reference": f"Surah {en['surah']['englishName']} ({en['surah']['name']}), Verse {ayah}",
        "arabic": ar["text"],
        "translation": en["text"],
        "juz": ar["juz"],
        "page": ar["page"],
    }, ensure_ascii=False)


@beta_tool
def get_surah_info(surah_number: int) -> str:
    """Get metadata about a surah: its Arabic and English names, revelation type, and verse count.

    Args:
        surah_number: The surah number, between 1 and 114.
    """
    try:
        resp = httpx.get(f"{QURAN_API}/surah/{surah_number}", timeout=10)
        data = resp.json()
    except Exception as exc:
        return f"Network error retrieving surah {surah_number}: {exc}"

    if data.get("status") != "OK":
        return f"Could not retrieve surah {surah_number}."

    s = data["data"]
    return json.dumps({
        "number": s["number"],
        "arabic_name": s["name"],
        "english_name": s["englishName"],
        "english_meaning": s["englishNameTranslation"],
        "revelation_type": s["revelationType"],
        "number_of_verses": s["numberOfAyahs"],
    }, ensure_ascii=False)


@beta_tool
def search_quran(keyword: str) -> str:
    """Search the Quran for verses containing a keyword or phrase (English translations).

    Returns up to 10 matching verses with their references and text.

    Args:
        keyword: The word or phrase to search for.
    """
    try:
        resp = httpx.get(f"{QURAN_API}/search/{keyword}/all/en", timeout=15)
        data = resp.json()
    except Exception as exc:
        return f"Network error during search: {exc}"

    if data.get("status") != "OK":
        return f"Search failed for '{keyword}'."

    matches = data["data"].get("matches", [])
    if not matches:
        return json.dumps({"keyword": keyword, "total": 0, "results": []})

    results = []
    for m in matches[:10]:
        results.append({
            "reference": f"{m['surah']['englishName']} {m['surah']['number']}:{m['numberInSurah']}",
            "text": m["text"],
        })

    return json.dumps({
        "keyword": keyword,
        "total_matches": data["data"]["count"],
        "showing": len(results),
        "results": results,
    })


@beta_tool
def get_verse_range(surah: int, start_ayah: int, end_ayah: int) -> str:
    """Retrieve a consecutive range of verses from a surah (up to 20 at a time) in English.

    Args:
        surah: The surah number, between 1 and 114.
        start_ayah: First verse number (inclusive).
        end_ayah: Last verse number (inclusive). Must be within 20 of start_ayah.
    """
    if end_ayah < start_ayah:
        return "end_ayah must be >= start_ayah."
    if (end_ayah - start_ayah) > 19:
        return "Can retrieve at most 20 verses at a time."

    try:
        resp = httpx.get(f"{QURAN_API}/surah/{surah}/en.sahih", timeout=15)
        data = resp.json()
    except Exception as exc:
        return f"Network error: {exc}"

    if data.get("status") != "OK":
        return f"Could not retrieve surah {surah}."

    s = data["data"]
    verses = [
        {"ayah": a["numberInSurah"], "text": a["text"]}
        for a in s["ayahs"]
        if start_ayah <= a["numberInSurah"] <= end_ayah
    ]

    return json.dumps({
        "surah": s["englishName"],
        "surah_number": surah,
        "verses": verses,
    })


TOOLS = [get_verse, get_surah_info, search_quran, get_verse_range]

SYSTEM_PROMPT = """You are a knowledgeable and respectful Quran Agent. You help users explore, \
understand, and reflect on the Holy Quran.

You have access to the following tools:
- get_verse: look up a single verse by surah and ayah number, returning Arabic text and translation
- get_surah_info: retrieve metadata about a surah (name, meaning, revelation type, verse count)
- search_quran: search for verses containing a keyword or phrase
- get_verse_range: retrieve a consecutive block of verses (up to 20) in English

Guidelines:
- Always cite verse references in the format "Surah Name, Verse N" or "Surah N:V"
- Present Arabic text faithfully when provided; do not alter it
- Use the Saheeh International English translation (provided by the API)
- Be respectful and accurate; acknowledge when a topic requires scholarly nuance
- If the user asks about a theme or topic, use search_quran to find relevant verses
- Keep responses concise but complete
"""


# ---------------------------------------------------------------------------
# Agent loop
# ---------------------------------------------------------------------------

def run_agent(user_message: str) -> None:
    """Run a single-turn agentic conversation with streaming output."""
    print(f"\nUser: {user_message}\n")
    print("Agent: ", end="", flush=True)

    runner = client.beta.messages.tool_runner(
        model="claude-opus-4-7",
        max_tokens=4096,
        thinking={"type": "adaptive"},
        system=SYSTEM_PROMPT,
        tools=TOOLS,
        messages=[{"role": "user", "content": user_message}],
    )

    for message in runner:
        for block in message.content:
            if hasattr(block, "type") and block.type == "text":
                print(block.text, end="", flush=True)

    print("\n")


def chat() -> None:
    """Run an interactive multi-turn chat session."""
    messages: list[dict] = []

    print("=" * 60)
    print("  Quran Agent — Ask anything about the Holy Quran")
    print("  Type 'quit' or 'exit' to end the session.")
    print("=" * 60)
    print()

    while True:
        try:
            user_input = input("You: ").strip()
        except (EOFError, KeyboardInterrupt):
            print("\nGoodbye!")
            break

        if not user_input:
            continue
        if user_input.lower() in {"quit", "exit", "q"}:
            print("Goodbye!")
            break

        messages.append({"role": "user", "content": user_input})
        print("\nAgent: ", end="", flush=True)

        runner = client.beta.messages.tool_runner(
            model="claude-opus-4-7",
            max_tokens=4096,
            thinking={"type": "adaptive"},
            system=SYSTEM_PROMPT,
            tools=TOOLS,
            messages=messages,
        )

        assistant_text = ""
        for message in runner:
            for block in message.content:
                if hasattr(block, "type") and block.type == "text":
                    print(block.text, end="", flush=True)
                    assistant_text += block.text

        print("\n")
        if assistant_text:
            messages.append({"role": "assistant", "content": assistant_text})


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    if len(sys.argv) > 1:
        question = " ".join(sys.argv[1:])
        run_agent(question)
    else:
        chat()
