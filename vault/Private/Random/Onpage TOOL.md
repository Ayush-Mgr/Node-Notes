---
title: "Onpage TOOL"
date: 2026-05-22T07:26:05.506Z
tags: [vault, web]
---

how about uper simple key word seo injector thats jsut some thing like (() => {
  const keywordPool = [
    "drone fungicide application corn",
    "agricultural drone sprayer companies",
    "professional crop spraying drone"
  ];

  const used = new Set();
  const changes = [];

  const selectors = [
    "p",
    "h1",
    "h2",
    "h3",
    ".rte p",
    ".article p",
    ".blog p",
    ".content p"
  ];

  const elements = [...document.querySelectorAll(selectors.join(","))]
    .filter(el => {
      const text = el.innerText?.trim();

      return (
        text &&
        text.length > 120 &&
        !el.closest("nav") &&
        !el.closest("header") &&
        !el.closest("footer") &&
        !el.closest(".menu") &&
        !el.closest(".mega-menu") &&
        !el.innerText.includes("drone fungicide application corn") &&
        !el.innerText.includes("agricultural drone sprayer companies") &&
        !el.innerText.includes("professional crop spraying drone")
      );
    });

  function injectKeyword(text, keyword) {
    const sentences = text.split(/(?<=[.!?])\s+/);

    if (sentences.length < 2) {
      return text + ` ${keyword}.`;
    }

    const insertIndex = Math.min(1, sentences.length - 1);

    const subtleInsertions = {
      "drone fungicide application corn":
        "This also supports drone fungicide application corn operations in larger fields.",

      "agricultural drone sprayer companies":
        "Many agricultural drone sprayer companies are also adopting similar workflow systems.",

      "professional crop spraying drone":
        "The setup is compatible with a professional crop spraying drone environment."
    };

    sentences.splice(
      insertIndex,
      0,
      subtleInsertions[keyword]
    );

    return sentences.join(" ");
  }

  elements.forEach(el => {
    if (used.size >= keywordPool.length) return;

    const keyword = keywordPool.find(k => !used.has(k));
    if (!keyword) return;

    const oldText = el.innerText.trim();
    const newText = injectKeyword(oldText, keyword);

    if (oldText !== newText) {
      el.innerText = newText;

      changes.push({
        keyword,
        old: oldText.slice(0, 220) + "...",
        updated: newText.slice(0, 260) + "..."
      });

      used.add(keyword);
    }
  });

  console.table(changes);

  console.log(
    `%cInjected ${changes.length} keyword updates successfully.`,
    "color: green; font-weight: bold;"
  );
})(); , and the all user has to do is give list of  key words and url the pogram goes to the url copy its body feed it to llm then llm fills the temlate of given function , and returns the user with report old new with pictures as well  

Tag
#idea #business