
export function getMockResponseStream(jsonData: object, delay = 100) {
  const stream = new ReadableStream({
    async start(controller) {
      // Split into chunks of 50 characters
      const chunks = JSON.stringify(jsonData).match(/.{1,50}/g);
      if (chunks) {
        for (const chunk of chunks) {
          // Enqueue the chunk
          controller.enqueue(new TextEncoder().encode(chunk));
          // Delay before sending the next chunk
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
      // Close the stream after all chunks are sent
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/json", // Or "text/plain"
    },
  });
}