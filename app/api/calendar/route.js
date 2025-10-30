import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { summary, description, date, time } = await request.json();

    if (!process.env.GOOGLE_CALENDAR_API_KEY) {
      return NextResponse.json(
        { error: "GOOGLE_CALENDAR_API_KEY is not configured" },
        { status: 500 }
      );
    }

    // Combine date and time to create start and end times
    const startDateTime = new Date(`${date}T${time}`);
    const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000); // 1 hour duration

    const event = {
      summary: summary,
      description: description,
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    };

    // Note: Google Calendar API requires OAuth 2.0 for creating events
    // API Key alone is not sufficient for creating calendar events
    // This is a placeholder - you'll need to implement OAuth 2.0 flow
    // For now, we'll just return success to indicate the todo was added
    
    return NextResponse.json({ 
      success: true, 
      message: "Todo added (Calendar integration requires OAuth setup)",
      event 
    });
  } catch (error) {
    console.error("Calendar API error:", error);
    return NextResponse.json(
      { error: "Failed to add to calendar", details: error.message },
      { status: 500 }
    );
  }
}
