"use client";
import Image from "next/image";
import React, { useState, useLayoutEffect, useRef } from "react";
import gsap from "gsap";

// --- THEME CONFIGURATION ---
const MONTH_THEMES = [
  { name: "January", short: "JAN", img: "/moon.jpg", bgOuter: "bg-slate-900", textAccent: "text-slate-600", bgAccent: "bg-slate-600", fillSvg: "fill-slate-600", bgLight: "bg-slate-50" },
  { name: "February", short: "FEB", img: "/momo.jpg", bgOuter: "bg-rose-900", textAccent: "text-rose-600", bgAccent: "bg-rose-600", fillSvg: "fill-rose-600", bgLight: "bg-rose-50" },
  { name: "March", short: "MAR", img: "/green.jpg", bgOuter: "bg-emerald-900", textAccent: "text-emerald-600", bgAccent: "bg-emerald-600", fillSvg: "fill-emerald-600", bgLight: "bg-emerald-50" },
  { name: "April", short: "APR", img: "/calanderImg.jpg", bgOuter: "bg-blue-900", textAccent: "text-blue-600", bgAccent: "bg-blue-600", fillSvg: "fill-blue-600", bgLight: "bg-blue-50" },
  { name: "May", short: "MAY", img: "/purple.jpg", bgOuter: "bg-fuchsia-900", textAccent: "text-fuchsia-600", bgAccent: "bg-fuchsia-600", fillSvg: "fill-fuchsia-600", bgLight: "bg-fuchsia-50" },
  { name: "June", short: "JUN", img: "/orange.jpg", bgOuter: "bg-amber-900", textAccent: "text-amber-600", bgAccent: "bg-amber-600", fillSvg: "fill-amber-600", bgLight: "bg-amber-50" },
  { name: "July", short: "JUL", img: "/darkRed.jpg", bgOuter: "bg-red-900", textAccent: "text-red-600", bgAccent: "bg-red-600", fillSvg: "fill-red-600", bgLight: "bg-red-50" },
  { name: "August", short: "AUG", img: "/darkOrange.jpg", bgOuter: "bg-orange-900", textAccent: "text-orange-600", bgAccent: "bg-orange-600", fillSvg: "fill-orange-600", bgLight: "bg-orange-50" },
  { name: "September", short: "SEP", img: "/black.jpg", bgOuter: "bg-stone-900", textAccent: "text-stone-600", bgAccent: "bg-stone-600", fillSvg: "fill-stone-600", bgLight: "bg-stone-50" },
  { name: "October", short: "OCT", img: "/brown.jpg", bgOuter: "bg-orange-950", textAccent: "text-orange-700", bgAccent: "bg-orange-700", fillSvg: "fill-orange-700", bgLight: "bg-orange-100" },
  { name: "November", short: "NOV", img: "/dark.jpg", bgOuter: "bg-zinc-900", textAccent: "text-zinc-600", bgAccent: "bg-zinc-600", fillSvg: "fill-zinc-600", bgLight: "bg-zinc-50" },
  { name: "December", short: "DEC", img: "/cyan.jpg", bgOuter: "bg-cyan-900", textAccent: "text-cyan-600", bgAccent: "bg-cyan-600", fillSvg: "fill-cyan-600", bgLight: "bg-cyan-50" },
];

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 3, 1));
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [hover, setHover] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [inputValue, setInputValue] = useState("");

  const compRef = useRef(null);
  const animDir = useRef(1); // Tracks which way we are flipping (1 = next, -1 = prev)
  const isAnimating = useRef(false); // Prevents spam clicking during animation

  const year = currentDate.getFullYear();
  const monthIndex = currentDate.getMonth();
  const theme = MONTH_THEMES[monthIndex];

  const firstDay = (new Date(year, monthIndex, 1).getDay() + 6) % 7;
  const totalDays = new Date(year, monthIndex + 1, 0).getDate();
  const dates = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ];

  // --- ANIMATIONS (GSAP) ---
  useLayoutEffect(() => {
    if (!compRef.current) return;

    let ctx = gsap.context(() => {
      // 1. 3D Flip IN
      gsap.fromTo(".cal-container", 
        { 
          rotationY: animDir.current > 0 ? 90 : -90, // Flip in from left or right based on direction
          opacity: 0, 
          scale: 0.9,
          transformPerspective: 1200 // Adds 3D depth to the flip
        }, 
        { 
          rotationY: 0, 
          opacity: 1, 
          scale: 1,
          duration: 0.6, 
          ease: "back.out(1.2)", 
          clearProps: "all",
          onComplete: () => { isAnimating.current = false; } // Unlock buttons
        }
      );
      
      // 2. Visible dates pop in
      gsap.fromTo(".date-visible", 
        { y: 10, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.4, stagger: 0.015, ease: "back.out(1.5)", delay: 0.3, clearProps: "all" }
      );
      
      // 3. Invisible (padding) dates setup
      gsap.fromTo(".date-invisible", 
        { opacity: 0 }, 
        { opacity: 1, duration: 1, stagger: 0.05, delay: 0.5, clearProps: "all" }
      );
    }, compRef);

    return () => ctx.revert();
  }, [currentDate]);

  // --- HANDLERS ---
  const handleDateClick = (day) => {
    if (!day) return;
    if (day === startDate && !endDate) { setStartDate(null); return; }
    if (!startDate || (startDate && endDate)) { setStartDate(day); setEndDate(null); } 
    else if (day < startDate) setStartDate(day);
    else if (day > startDate) setEndDate(day);
  };

  const changeMonth = (offset) => {
    // If an animation is already running, ignore the click to prevent visual bugs
    if (isAnimating.current) return;
    isAnimating.current = true;
    animDir.current = offset;

    // FLIP OUT before changing the state
    gsap.to(".cal-container", {
      rotationY: offset > 0 ? -90 : 90, // Flip out to the opposite side
      opacity: 0,
      scale: 0.9,
      duration: 0.3,
      ease: "power2.in",
      transformPerspective: 1200,
      onComplete: () => {
        // Change state once it's invisible. This triggers the useLayoutEffect to flip it back in.
        setCurrentDate(new Date(year, monthIndex + offset, 1));
        setStartDate(null);
        setEndDate(null);
      }
    });
  };

  const handleAddTask = (e) => {
    if (e.key === "Enter" && inputValue.trim() !== "") {
      const rangeStr = startDate 
        ? (endDate ? `${theme.short} ${startDate}-${endDate}` : `${theme.short} ${startDate}`)
        : "General";
      
      setTasks([{ id: Date.now(), text: inputValue, range: rangeStr }, ...tasks]);
      setInputValue("");
      setHover(false); 
    }
  };

  return (
    <div ref={compRef} className={`min-h-screen flex items-center justify-center p-6 md:p-10 font-sans transition-colors duration-500 ${theme.bgOuter}`}>
      
      <div className="cal-container w-full max-w-2xl bg-white shadow-2xl relative flex flex-col overflow-hidden rounded-sm">
        
        {/* Top Wire Binder */}
        <div className="absolute top-0 left-0 right-0 h-8 flex justify-center items-start gap-1 z-30 pt-1">
          {[...Array(24)].map((_, i) => (
            <div key={i} className="w-[2px] h-5 bg-gray-600 rounded-full shadow-sm"></div>
          ))}
        </div>

        {/* Hero Image Section */}
        <div 
          className="relative h-[350px] md:h-[450px] w-full group cursor-pointer"
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          onClick={() => setHover(!hover)} 
        >
          {/* Instructions */}
          {!hover && (
            <div className="absolute top-12 left-1/2 -translate-x-1/2 z-20 text-[10px] font-bold text-white bg-black/40 px-4 py-1.5 rounded-full backdrop-blur-sm tracking-widest uppercase border border-white/20">
              <span className="hidden md:inline">Hover to add tasks</span>
              <span className="inline md:hidden">Tap to add tasks</span>
            </div>
          )}

          <Image src={theme.img} fill className="object-cover transition-opacity duration-500" alt={`${theme.name} Art`} priority />

          {/* Month/Year Navigation */}
          <div className="absolute top-10 left-6 right-6 flex justify-between z-30">
            <button onClick={(e) => { e.stopPropagation(); changeMonth(-1); }} className="bg-black/40 hover:bg-black/60 backdrop-blur text-white h-8 w-8 rounded-full flex items-center justify-center transition">
              ←
            </button>
            <button onClick={(e) => { e.stopPropagation(); changeMonth(1); }} className="bg-black/40 hover:bg-black/60 backdrop-blur text-white h-8 w-8 rounded-full flex items-center justify-center transition">
              →
            </button>
          </div>

          {/* Geometric Divider */}
          <div className="absolute bottom-0 left-0 w-full h-32 z-10">
            <svg viewBox="0 0 500 150" preserveAspectRatio="none" className="h-full w-full">
              <path d="M0,80 L150,130 L350,50 L500,100 L500,150 L0,150 Z" className={`${theme.fillSvg} transition-colors duration-500`} />
            </svg>
            <div className="absolute bottom-6 right-8 text-right text-white">
               <h2 className="text-xl md:text-2xl font-light leading-none opacity-80">{year}</h2>
               <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">{theme.name}</h1>
            </div>
          </div>

          {/* Task Input Overlay */}
          {hover && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[4px] flex items-center justify-center z-20 p-6 animate-in fade-in zoom-in duration-200">
              <div className={`bg-white p-5 shadow-2xl border-t-4 ${theme.borderAccent || theme.bgAccent.replace('bg-', 'border-')} w-full max-w-xs transform md:rotate-1`} onClick={(e) => e.stopPropagation()}>
                 <div className="flex justify-between items-center mb-2">
                    <p className={`text-[10px] font-black uppercase tracking-tighter ${theme.textAccent}`}>Add Task</p>
                    <button className="md:hidden text-gray-400 text-xs font-bold" onClick={() => setHover(false)}>CLOSE ✕</button>
                 </div>
                 <p className="text-[10px] text-gray-400 mb-2">
                   Attaching to: {startDate ? (endDate ? `${startDate}-${endDate}` : `${startDate}`) : "General Month"}
                 </p>
                 <input 
                    autoFocus
                    className="w-full border-b border-gray-200 focus:border-gray-500 focus:outline-none text-sm py-2 text-gray-700" 
                    placeholder="Type task and press Enter..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleAddTask}
                 />
              </div>
            </div>
          )}
        </div>

        {/* Bottom: Task List + Grid */}
        <div className="flex flex-col md:flex-row p-6 md:p-10 pt-4 gap-10 bg-white">
          
          <div className="w-full md:w-1/3">
            <div className="flex justify-between items-baseline border-b border-gray-100 pb-1 mb-4">
              <p className="text-[11px] font-black text-gray-900 uppercase tracking-[0.2em]">To-Do List</p>
              <span className="text-[9px] text-gray-400 font-bold">{tasks.length} items</span>
            </div>
            <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
              {tasks.length === 0 ? (
                <p className="text-xs text-gray-400 italic">No tasks added yet.</p>
              ) : (
                tasks.map((task) => (
                  <div key={task.id} className="flex flex-col gap-1 border-l-2 pl-2 border-gray-200">
                     <span className={`text-[8px] font-bold uppercase tracking-wider ${theme.bgLight} ${theme.textAccent} self-start px-1 rounded`}>
                       {task.range}
                     </span>
                     <p className="text-[12px] text-gray-700 font-medium leading-tight">{task.text}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="w-full md:w-2/3">
            <div className="grid grid-cols-7 gap-1 text-center">
              {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map(d => (
                <div key={d} className="text-[10px] font-black text-gray-900 mb-3 tracking-tighter">{d}</div>
              ))}
              
              {dates.map((day, index) => {
                const isStart = startDate === day;
                const isEnd = endDate === day;
                const inRange = day > startDate && day < endDate;

                return (
                  <button
                    key={index}
                    onClick={() => handleDateClick(day)}
                    disabled={!day}
                    className={`
                      ${day ? "date-visible cursor-pointer hover:bg-gray-500" : "date-invisible opacity-0 pointer-events-none"}
                      h-10 md:h-12 text-sm transition-all text-black duration-150 relative
                      ${isStart || isEnd ? `${theme.bgAccent} text-black font-bold scale-105 z-10 shadow-md` : "text-gray-600"}
                      ${inRange ? `${theme.bgLight} ${theme.textAccent}` : ""}
                    `}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            <div className="flex justify-between items-center mt-6 border-t border-gray-100 pt-4">
              {(startDate || endDate) ? (
                <button 
                  onClick={() => { setStartDate(null); setEndDate(null); }}
                  className={`text-[10px] font-bold ${theme.textAccent} hover:opacity-70 uppercase tracking-widest transition-opacity`}
                >
                  [ Clear Dates ]
                </button>
              ) : <div></div>}

              {tasks.length > 0 && (
                <button 
                  onClick={() => setTasks([])}
                  className="text-[10px] font-bold text-red-500 hover:text-red-700 uppercase tracking-widest transition-opacity"
                >
                  [ Clear Tasks ]
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;