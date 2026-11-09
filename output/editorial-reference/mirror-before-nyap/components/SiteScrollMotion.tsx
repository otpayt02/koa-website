"use client";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { scrollKinetics } from "./scrollKinetics";

/** Native scroll choreography: cached geometry, tanh depth, dt-correct exponential response.
 * One scheduler updates DOM depth and the shared wind; each canvas keeps its existing lifecycle.
 * Visible semantic HTML, once-only word reveals, reversible depth, OS reduced-motion freeze. */
export function SiteScrollMotion() {
 const pathname = usePathname();
 useEffect(() => {
  const main = document.querySelector<HTMLElement>("#main-content");
  if (!main || /\/admin(?:\/|$)/.test(pathname)) return;
  const preference = matchMedia("(prefers-reduced-motion: reduce)");
  const frozen = () => preference.matches || new URLSearchParams(location.search).get("motion") === "off";
  const animations = new Set<Animation>();
  const revealed = new WeakSet<Element>();
  let frame = 0, previous = 0, sampledAt = performance.now(), sampledY = window.scrollY, targetVelocity = 0;
  let layers: { element: HTMLElement; center: number; amount: number; value: number }[] = [];
  const measure = () => {
   layers = [...main.querySelectorAll<HTMLElement>(".koa-static-portrait, .koa-static-identity, .koa-static-story, .content-page__documentary, .documentary-collection figure, .page-hero__content, .image-story__media")].map((element,index) => ({ element, center: element.getBoundingClientRect().top + window.scrollY + element.offsetHeight/2, amount: element.matches("figure,.koa-static-portrait") ? 14 : 7, value: 0 }));
  };
  const tick = (now: number) => {
   frame = 0;
   if (document.hidden || frozen()) return;
   const dt = Math.min(.05, previous ? (now-previous)/1000 : .016); previous=now;
   if (now-sampledAt>60) targetVelocity *= Math.exp(-6*dt);
   const response = 1-Math.exp(-10*dt);
   scrollKinetics.velocity += (targetVelocity-scrollKinetics.velocity)*response;
   scrollKinetics.position = sampledY;
   const wind = Math.tanh(scrollKinetics.velocity/1100);
   document.documentElement.style.setProperty("--grid-lean", `${Math.tanh(sampledY/900)*-6 + wind*-5}px`);
   let unsettled = Math.abs(scrollKinetics.velocity)>1;
   for(const layer of layers) {
    const target = Math.tanh((sampledY+window.innerHeight/2-layer.center)/Math.max(400,window.innerHeight)) * -layer.amount;
    layer.value += (target-layer.value)*(1-Math.exp(-7*dt));
    layer.element.style.setProperty("--scroll-depth", `${layer.value.toFixed(2)}px`);
    if(Math.abs(target-layer.value)>.05) unsettled=true;
   }
   if(unsettled) frame=requestAnimationFrame(tick);
  };
  const wake = () => { if(!frame&&!frozen()&&!document.hidden) { previous=0; frame=requestAnimationFrame(tick); } };
  const scroll = () => {
   const now=performance.now(), y=window.scrollY;
   targetVelocity=Math.max(-2400,Math.min(2400,(y-sampledY)/Math.max(.008,(now-sampledAt)/1000)));
   sampledY=y; sampledAt=now; wake();
  };
  const observer = new IntersectionObserver((entries) => {
   if(frozen()) return;
   for(const entry of entries) {
    if(!entry.isIntersecting || revealed.has(entry.target)) continue;
    revealed.add(entry.target);observer.unobserve(entry.target);
    const element=entry.target as HTMLElement;
    const heading=element.matches("h1,h2");
    let targets=[element];
    if(heading && !element.querySelector(".cinema-word")) {
     const words=element.textContent?.trim().split(/\s+/) || [];
     element.replaceChildren();
     targets=words.map((word,index) => {const span=document.createElement("span");span.className="cinema-word";span.textContent=word;element.append(span);if(index<words.length-1)element.append(" ");return span;});
    }
    targets.forEach((target,index)=>{
     const animation=target.animate([
      {opacity:.25,transform:heading?"translateY(22px) rotateX(9deg)":"translateY(14px)",filter:heading?"blur(5px)":"blur(2px)"},
      {opacity:1,transform:"none",filter:"blur(0px)"}
     ],{duration:heading?1250:1000,delay:heading?Math.min(index*55,377):89,easing:"cubic-bezier(.16,1,.3,1)",fill:"none"});
     animations.add(animation);animation.onfinish=()=>animations.delete(animation);
    });
   }
  },{threshold:.1,rootMargin:"0px 0px -3% 0px"});
  const register=()=>main.querySelectorAll<HTMLElement>("h1,h2,.content-section__body,.koa-static-tagline,.koa-static-intro,.koa-static-pillar-copy > p:not(.koa-static-kicker)").forEach(element=>{if(!element.closest("form,nav,[data-no-reveal]")&&!revealed.has(element))observer.observe(element);});
  const reset=()=>{
   if(frame)cancelAnimationFrame(frame);frame=0;scrollKinetics.velocity=0;targetVelocity=0;
   animations.forEach(animation=>animation.cancel());animations.clear();
   layers.forEach(layer=>layer.element.style.removeProperty("--scroll-depth"));
   document.documentElement.style.removeProperty("--grid-lean");
   if(!frozen()){measure();register();wake();}
  };
  const resize=()=>{measure();wake();};
  const mutation=new MutationObserver(()=>{register();measure();wake();});
  const pillars=main.querySelector(".koa-static-pillars");if(pillars)mutation.observe(pillars,{childList:true});
  measure();register();wake();
  window.addEventListener("scroll",scroll,{passive:true});window.addEventListener("resize",resize,{passive:true});
  document.addEventListener("visibilitychange",wake);preference.addEventListener("change",reset);
  void document.fonts.ready.then(()=>{if(main.isConnected)resize();});
  return()=>{if(frame)cancelAnimationFrame(frame);observer.disconnect();mutation.disconnect();animations.forEach(animation=>animation.cancel());window.removeEventListener("scroll",scroll);window.removeEventListener("resize",resize);document.removeEventListener("visibilitychange",wake);preference.removeEventListener("change",reset);scrollKinetics.velocity=0;document.documentElement.style.removeProperty("--grid-lean");layers.forEach(layer=>layer.element.style.removeProperty("--scroll-depth"));};
 },[pathname]);
 return null;
}
