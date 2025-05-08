// DhtmlxTreeGrid.js
import React, { useEffect, useRef } from "react";
import { setGanttSkin } from "./setGanttSkin";

let ganttInitialized = false; // Gantt가 init되었는지 여부

export default function DhtmlxTreeGrid({ data }) {
  const ganttContainerRef = useRef(null);

  // (1) 마운트 시 1회 init
  useEffect(() => {
    console.log("마운트 시 1회 init")
    if (!window.gantt) {
      console.error("❌ dhtmlxGantt가 로드되지 않았습니다.");
      return;
    }

    // 기본 설정
    window.gantt.config.show_chart = false; // 차트 영역 숨김
    window.gantt.config.columns = [
      { name: "text", label: "항목명", tree: true, width: "*" },
      { name: "description", label: "설명", width: 200 },
    ];

    // 초기 테마 적용
    setGanttSkin(getCoreUITheme());
    // CSS만 교체 + onload 후 gantt.render()가 실행

    // Gantt init (단 한 번)
    window.gantt.init(ganttContainerRef.current);
    ganttInitialized = true;

    // 언마운트 시 destructor
    return () => {
      if (window.gantt?.destructor) {
        // window.gantt.destructor();
        window.gantt.clearAll();
      }
      ganttInitialized = false;
    };
  }, []);

  // (2) 데이터 바뀔 때 -> clearAll + parse
  useEffect(() => {
    if (ganttInitialized && window.gantt) {
      window.gantt.clearAll();
      window.gantt.parse({
        data: data?.map(item => ({
          id: item.bizSeq,
          parent: item.parentSeq || 0,
          text: item.name,
          description: item.description,
          start_date: "2025-01-01",
          duration: 1,
        })) || [],
        links: []
      });
    }
  }, [data]);

  // (3) CoreUI 테마 변경 감시 -> setGanttSkin()
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setGanttSkin(getCoreUITheme());
      // CSS 교체 + onload -> gantt.render()
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-coreui-theme"]
    });
    return () => observer.disconnect();
  }, []);

  // Helper
  function getCoreUITheme() {
    return document.documentElement.getAttribute("data-coreui-theme") || "light";
  }

  return <div ref={ganttContainerRef} style={{ width: "100%", height: "600px" }} />;
}
