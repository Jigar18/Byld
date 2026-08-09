"use client";

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProjectImage } from "./ProjectImageUploader";

export default function ProjectImageCarousel({ images }: { images: ProjectImage[] }) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ active: false, startX: 0, scrollLeft: 0 });
  const [activeIndex, setActiveIndex] = useState(0);
  const orderedImages = [...images].sort((left, right) => left.position - right.position);

  const showImage = (index: number) => {
    const carousel = carouselRef.current;
    if (!carousel) return;
    carousel.scrollTo({ left: carousel.clientWidth * index, behavior: "smooth" });
    setActiveIndex(index);
  };

  const updateIndex = () => {
    const carousel = carouselRef.current;
    if (carousel) setActiveIndex(Math.round(carousel.scrollLeft / carousel.clientWidth));
  };

  return (
    <div className="relative overflow-hidden rounded-xl border border-white/10 bg-black/35 shadow-lg">
      <div
        ref={carouselRef}
        className="flex cursor-grab snap-x snap-mandatory overflow-x-auto scroll-smooth [scrollbar-width:none] active:cursor-grabbing [&::-webkit-scrollbar]:hidden"
        onScroll={updateIndex}
        onPointerDown={(event) => {
          if (event.pointerType !== "mouse" || event.button !== 0) return;
          dragRef.current = { active: true, startX: event.clientX, scrollLeft: event.currentTarget.scrollLeft };
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          if (!dragRef.current.active) return;
          event.currentTarget.scrollLeft = dragRef.current.scrollLeft - (event.clientX - dragRef.current.startX);
        }}
        onPointerUp={(event) => {
          dragRef.current.active = false;
          if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
          showImage(Math.round(event.currentTarget.scrollLeft / event.currentTarget.clientWidth));
        }}
        onPointerCancel={() => { dragRef.current.active = false; }}
        onDragStart={(event) => event.preventDefault()}
      >
        {orderedImages.map((image, index) => (
          <div key={image.imagePublicId} className="aspect-video w-full shrink-0 snap-center bg-black">
            <img src={image.imageUrl} alt={`Project screenshot ${index + 1}`} draggable={false} className="h-full w-full select-none object-contain" />
          </div>
        ))}
      </div>
      {orderedImages.length > 1 && (
        <>
          <button type="button" onClick={() => showImage(Math.max(0, activeIndex - 1))} disabled={activeIndex === 0} className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-black/70 text-white backdrop-blur transition hover:bg-black/90 disabled:opacity-30" aria-label="Previous screenshot"><ChevronLeft className="h-5 w-5" /></button>
          <button type="button" onClick={() => showImage(Math.min(orderedImages.length - 1, activeIndex + 1))} disabled={activeIndex === orderedImages.length - 1} className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-black/70 text-white backdrop-blur transition hover:bg-black/90 disabled:opacity-30" aria-label="Next screenshot"><ChevronRight className="h-5 w-5" /></button>
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-full bg-black/65 px-2.5 py-2 backdrop-blur">
            {orderedImages.map((image, index) => <button key={image.imagePublicId} type="button" onClick={() => showImage(index)} className={`h-1.5 rounded-full transition-all ${index === activeIndex ? "w-5 bg-white" : "w-1.5 bg-white/45 hover:bg-white/70"}`} aria-label={`Show screenshot ${index + 1}`} />)}
          </div>
        </>
      )}
    </div>
  );
}
