import type { CSSProperties } from "react";

export function SealAssembly({ rotation }: { rotation: number }) {
  return (
    <div
      className="cinematic-seal"
      style={{ "--seal-annulus-turn": `${rotation}deg` } as CSSProperties}
      aria-hidden="true"
    >
      <img
        className="cinematic-seal__core"
        src="/koa/assets/koa-seal-white-lettering-v2.png"
        alt=""
        width="1254"
        height="1254"
        aria-hidden="true"
        draggable="false"
      />
      <img
        className="cinematic-seal__annulus"
        src="/koa/assets/koa-seal-white-lettering-v2.png"
        alt=""
        width="1254"
        height="1254"
        aria-hidden="true"
        draggable="false"
      />
    </div>
  );
}
