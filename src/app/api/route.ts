import { NextResponse } from "next/server";

const get_movie_details = async (name: string) => {
  console.log("Calling MovieDB");
  const movieDBUrl = `http://www.omdbapi.com/?apikey=${process.env.OMDB_API_KEY}&t=${name}`;
  const movieDBRes = await fetch(movieDBUrl);
  const movieDBData = await movieDBRes.json();

  return movieDBData;
};

export async function POST(request: Request) {
  const { prompt } = await request.json();

  // Step 1, send model the user query and what functions it has access to
  const initialBody = {
    model: "gpt-3.5-turbo-0613",
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    functions: [
      {
        name: "get_movie_details",
        description:
          "Get various details about a movie, like ratings, release date, genre etc.",
        parameters: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "The name of the movie to get the details for",
            },
          },
          required: ["name"],
        },
      },
    ],
    function_call: "auto",
  };

  console.log(`Initial call to GPT with prompt: "${prompt}"`);
  const initialResponse = await fetch(
    "https://api.openai.com/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify(initialBody),
    }
  );

  const data = await initialResponse.json();

  const message = data?.choices[0]?.message;

  // Step 2, check if the model wants to call a function
  if (message.function_call) {
    console.log("Model wants to call a function");
    const functionName = message.function_call?.name;
    const functionArgName = JSON.parse(message.function_call?.arguments)?.name;

    // Step 3, call the function / movieDB API
    const movieDBData = await get_movie_details(functionArgName);

    // Step 4, send model the info on the function call and function response
    console.log("Making final call to GPT with the movie data");
    const finalBody = {
      model: "gpt-3.5-turbo-0613",
      messages: [
        {
          role: "user",
          content: prompt,
        },
        message,
        {
          role: "function",
          name: functionName,
          content: JSON.stringify(movieDBData),
        },
      ],
    };
    const finalResponse = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify(finalBody),
      }
    );

    const finalData = await finalResponse.json();

    return NextResponse.json(finalData.choices[0].message);
  }
  console.log("Normal response from GPT (no function call)");
  return NextResponse.json(message);
}
