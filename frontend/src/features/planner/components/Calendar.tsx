/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useEffect, useState, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { api } from "@/lib/api";

export function CustomCalendar({ events, setEvents, fetchEvents }: any) {
  const calendarRef = useRef<FullCalendar>(null);

  const handleEventDrop = async (dropInfo: any) => {
    const { event } = dropInfo;
    
    // Optimistic update
    setEvents((prev: any) => prev.map((e: any) => 
      e.id === event.id 
        ? { ...e, start_time: event.start.toISOString(), end_time: event.end?.toISOString() || event.start.toISOString() }
        : e
    ));

    try {
      await api.put(`/events/${event.id}`, {
        start_time: event.start.toISOString(),
        end_time: event.end?.toISOString() || event.start.toISOString(),
      });
    } catch (error) {
      console.error("Failed to reschedule event", error);
      fetchEvents(); // revert on fail
    }
  };

  const handleDateSelect = async (selectInfo: any) => {
    const title = prompt('Please enter a title for your schedule');
    const calendarApi = selectInfo.view.calendar;
    calendarApi.unselect(); // clear date selection

    if (title) {
      try {
        await api.post("/events/", {
          title,
          start_time: selectInfo.startStr,
          end_time: selectInfo.endStr,
          is_ai_scheduled: false
        });
        fetchEvents();
      } catch (error) {
        console.error("Failed to create event", error);
        alert("Failed to create manual event.");
      }
    }
  };

  const formattedEvents = events.map((e: any) => ({
    id: e.id,
    title: e.title,
    start: e.start_time,
    end: e.end_time,
    backgroundColor: e.color || "#1a1a1a",
    borderColor: "transparent",
    textColor: e.color ? "#1a1a1a" : "#fff",
    extendedProps: {
      is_ai_scheduled: e.is_ai_scheduled
    }
  }));

  return (
    <div className="bg-white rounded-[32px] p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-black/5 h-full min-h-[600px] planner-calendar">
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay"
        }}
        events={formattedEvents}
        editable={true}
        selectable={true}
        selectMirror={true}
        select={handleDateSelect}
        droppable={true}
        eventDrop={handleEventDrop}
        eventResize={handleEventDrop}
        height="100%"
        allDaySlot={false}
        expandRows={true}
        stickyHeaderDates={true}
      />
    </div>
  );
}
