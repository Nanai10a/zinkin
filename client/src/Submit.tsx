import { useCallback, useState } from "preact/hooks";

import { fetchAPI, Post } from "./api";
import { posts } from "./posts";

import { root } from "./Submit.css.ts";

const unshiftPosts = (...val: Post[]) => {
  posts.value = [...val, ...posts.value];
};

export const Submit = () => {
  const [text, setText] = useState("");

  const update = useCallback(
    (e: Event) => setText((e.target as HTMLTextAreaElement).value),
    [setText],
  );

  const submit = useCallback(
    async (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "Enter") {
        const res = await fetchAPI("/posts", "POST", { content: text });

        unshiftPosts(res);
        setText("");
      }
    },
    [text, setText],
  );

  return (
    <textarea
      class={root}
      rows={3}
      value={text}
      onInput={update}
      onKeyDown={submit}
    />
  );
};
