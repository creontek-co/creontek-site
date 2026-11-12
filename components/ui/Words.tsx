import { Fragment } from "react";

/**
 * Splits text into masked words in the server-rendered markup, so the real
 * text is in the DOM before any script runs.
 */
export function Words({ text }: { text: string }) {
  const words = text.split(" ");
  return (
    <>
      {words.map((w, i) => (
        <Fragment key={i}>
          <span className="w">
            <span className="wi">{w}</span>
          </span>
          {i < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </>
  );
}
