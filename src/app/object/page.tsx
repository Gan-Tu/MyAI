"use client";

import { experimental_useObject as useObject } from "ai/react";
import { z } from "zod";

// define a schema for the notifications
const notificationSchema = z.object({
  notifications: z.array(
    z.object({
      name: z.string().describe("Name of a fictional person."),
      message: z.string().describe("Message. Do not use emojis or links."),
      minutesAgo: z.number()
    })
  )
});

export default function Page() {
  const { object, submit, isLoading, stop } = useObject({
    api: "/api/object",
    schema: notificationSchema
  });

  return (
    <div className="bg-gray-100 p-4 rounded-lg w-full shadow">
      <button
        className="bg-black text-white px-4 py-2 mb-4 rounded"
        onClick={() => submit("Messages during finals week.")}
        disabled={isLoading}
      >
        Generate notifications
      </button>

      {isLoading && (
        <div>
          <div>Loading...</div>
          <button
            type="button"
            onClick={() => stop()}
            className="bg-black text-white px-4 py-2 mb-4 rounded"
          >
            Stop
          </button>
        </div>
      )}

      {object?.notifications?.map((notification, index) => (
        <div
          key={index}
          className="bg-gray-50 rounded-lg p-4 mb-4 shadow-sm flex justify-between items-start"
        >
          <div>
            <p className="text-gray-800 font-medium">{notification?.name}</p>
            <p className="text-gray-600 text-sm">{notification?.message}</p>
          </div>
          <span className="text-gray-500 text-xs whitespace-nowrap">
            {notification?.minutesAgo}m ago
          </span>
        </div>
      ))}
    </div>
  );
}
