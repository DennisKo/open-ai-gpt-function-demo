"use client";
import { useState, KeyboardEvent, useRef } from "react";
import { PaperAirplaneIcon } from "@heroicons/react/20/solid";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function Home() {
  const promptInput = useRef<HTMLInputElement>(null);
  const [ratings, setRatings] = useState(null);
  const [loading, setLoading] = useState(false);
  const prompt = async () => {
    const prompt = promptInput.current?.value;
    setLoading(true);
    const res = await fetch("/api/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: prompt,
      }),
    });
    const data = await res.json();
    setRatings(data.content);
    setLoading(false);
  };

  const handlePromptKey = async (e: KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      prompt();
    }
  };

  console.log(ratings);
  return (
    <main className="flex min-h-screen flex-col items-center  p-24">
      <div>
        <label
          htmlFor="prompt"
          className="block text-sm font-medium leading-6 text-gray-900"
        >
          Ask the MovieDB
        </label>
        <div className="mt-2 mb-12 flex rounded-md shadow-sm w-[600px]">
          <div className="relative flex flex-grow items-stretch focus-within:z-10">
            <input
              ref={promptInput}
              type="text"
              name="prompt"
              id="prompt"
              className="block w-full rounded-none rounded-l-md border-0 py-1.5  text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              placeholder="What are the ratings and the release date for the movie Banshees of Inisherin?"
              defaultValue="What are the ratings and the release date for the movie Banshees of Inisherin?"
              onKeyDown={handlePromptKey}
              autoFocus
            />
          </div>
          <button
            type="button"
            onClick={prompt}
            className="relative -ml-px inline-flex items-center gap-x-1.5 rounded-r-md px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            <PaperAirplaneIcon
              className="-ml-0.5 h-5 w-5 text-gray-400"
              aria-hidden="true"
            />
          </button>
        </div>
      </div>
      <article className="prose">
        {loading ? (
          "Loading..."
        ) : (
          <ReactMarkdown children={ratings || ""} remarkPlugins={[remarkGfm]} />
        )}
      </article>
    </main>
  );
}
