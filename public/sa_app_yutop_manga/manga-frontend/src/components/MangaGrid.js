import React from "react";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
import MangaCard from "./MangaCard";

export default function MangaGrid({ mangaList, setMangaList }) {
  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;
    if (active.id !== over.id) {
      const oldIndex = mangaList.findIndex((m) => m.id === active.id);
      const newIndex = mangaList.findIndex((m) => m.id === over.id);
      setMangaList(arrayMove(mangaList, oldIndex, newIndex));
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={mangaList} strategy={verticalListSortingStrategy}>
        <div className="d-flex flex-wrap justify-content-start" style={{ gap: "8px" }}>
          {mangaList.map((manga) => (
            <MangaCard key={manga.id} manga={manga} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
