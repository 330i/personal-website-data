"use client"

import clsx from "clsx";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

function BlogLink({ timestamp, entry }) {
    return (
        <Link
            className='flex flex-col gap-3 group cursor-pointer'
            href={{
                pathname: '/blog/[slug]',
                query: { slug: timestamp },
            }}
        >
            <div className='text-2xl font-semibold flex flex-row gap-5 relative'>
                <div className='opacity-100 group-hover:opacity-0 transition-all duration-300'>{entry.title}</div>
                <div className='handwritten opacity-0 group-hover:opacity-100 absolute left-0 -top-1 flex flex-row text-4xl transition-all duration-300'>
                    {entry.title}
                    <div className='opacity-0 group-hover:opacity-100 transition-all delay-150 ml-2'>&gt;</div>
                    <div className='opacity-0 group-hover:opacity-75 transition-all delay-[225ms]'>&gt;</div>
                    <div className='opacity-0 group-hover:opacity-50 transition-all delay-300'>&gt;</div>
                    <div className='opacity-0 group-hover:opacity-25 transition-all delay-[375ms]'>&gt;</div>
                </div>
            </div>
            <div className='relative'>
                <div className='opacity-100 group-hover:opacity-0 transition-all duration-300'>{entry.description}</div>
                <div className='handwritten opacity-0 group-hover:opacity-100 transition-all duration-300 absolute left-0 -top-1 text-xl'>{entry.description}</div>
            </div>
        </Link>
    );
}

function CodeBlock({ children, className, isExpandable=false }) {
    const codeArea = useRef();
    const [copyText, setCopyText] = useState();
    const [isCopied, setIsCopied] = useState(false);
    const [isOpen, setIsOpened] = useState(false);

    useEffect(() => {
        if(codeArea.current && codeArea.current.textContent) {
            setCopyText(codeArea.current.textContent);
        }
    }, [codeArea]);

    return (
        <div className="relative w-full rounded-lg overflow-hidden border border-zinc-700 divide-zinc-700 divide-y">
            <button
                className={clsx(
                    "absolute bottom-4 right-4 border w-10 h-10 p-2 rounded-md hover:brightness-150 transition-all cursor-pointer",
                    (isExpandable && !isOpen) && "hidden"
                )}
                onClick={() => {
                    setIsCopied(true);
                    navigator.clipboard.writeText(copyText);
                    setTimeout(() => {
                        setIsCopied(false);
                    }, 1000);
                }}
            >
                {
                    isCopied ?
                    <img src="/icons/check.svg" className="w-full h-full" /> :
                    <img src="/icons/copy.svg" className="w-full h-full" />
                }
            </button>
            <button
                className={clsx(
                    "absolute right-0 top-0 w-11 h-11 p-2 hover:brightness-150 border-0 transition-all cursor-pointer",
                    isOpen && "rotate-180",
                    !isExpandable && "hidden"
                )}
                onClick={() => {
                    setIsOpened((val) => !val);
                }}
            >
                <img src="/icons/keyboard_arrow_down.svg" className="w-full h-full" />
            </button>
            {
                children.props.filename ?
                <div className="flex flex-col px-6 py-3 bg-zinc-900 text-white/80 text-sm font-light">
                    {children.props.filename}
                </div> :
                (
                    isExpandable ?
                    <div className="h-11 bg-zinc-900"></div> :
                    []
                )
            }
            <div
                className={clsx(
                    "bg-zinc-900 overflow-x-scroll",
                    className,
                    (isExpandable && !isOpen) ? "max-h-0 p-0" : "p-6"
                )}
                ref={codeArea}
            >
                {children}
            </div>
        </div>
    );
}

function ImageBlock({ src, desc, origin }) {
    const [selected, setSelected] = useState(false);
    const [aspectRatio, setAspectRatio] = useState(4/3);
    const [zoom, setZoom] = useState(100);
    const [offset, setOffset] = useState({x: 0, y: 0});
    const [isDragging, setIsDragging] = useState(false);
    const [prevMousePosition, setPrevMousePosition] = useState();
    let isTicking = false;

    return (
        <div>
            <div
                className={clsx(selected && "absolute left-0 top-0 w-screen h-screen backdrop-blur-sm z-50", "flex items-center justify-center rounded-lg overflow-hidden bg-zinc-900/50")}
            >
                <div
                    className={clsx(selected ? "relative w-screen h-screen overflow-hidden" : "w-full")}
                    onWheel={(e) => {
                        if(!selected) return;
                        const bounds = document.getElementById(`img-${src}`).getBoundingClientRect();
                        setZoom(zoom * (1 - e.deltaY * 0.001));
                        setOffset({x: offset.x + e.deltaY * 0.001 * (e.clientX - bounds.left), y: offset.y + e.deltaY * 0.001 * (e.clientY - bounds.top)});
                    }}
                    onPointerDown={() => {
                        if(!selected) return;
                        setIsDragging(true);
                        setPrevMousePosition(null);
                    }}
                    onPointerMove={(e) => {
                        if(!selected) return;
                        if (!isTicking) requestAnimationFrame(() => {
                            isTicking = false;
                            if(!isDragging) return;
                            if(prevMousePosition) setOffset({x: offset.x + e.clientX - prevMousePosition.x, y: offset.y + e.clientY - prevMousePosition.y});
                            setPrevMousePosition({x: e.clientX, y: e.clientY});
                        });
                        isTicking = true;
                    }}
                    onPointerUp={() => {
                        if(!selected) return;
                        setIsDragging(false);
                        setPrevMousePosition(null);
                    }}
                >
                    <img
                        src={src}
                        id={`img-${src}`}
                        className={clsx(selected ? "absolute w-auto select-none" : "w-full", "object-contain")}
                        draggable={false}
                        onClick={() => setSelected(true)}
                        onLoad={(e) => setAspectRatio(e.width / e.height)}
                        style={{
                            minWidth: `${zoom}%`,
                            maxWidth: `${zoom}%`,
                            height: `${zoom}%`,
                            left: `${offset.x}px`,
                            top: `${offset.y}px`
                        }}
                    />
                    <div
                        className={clsx(selected ? "absolute right-4 top-4 w-10 h-10 hover:brightness-150 transition-all cursor-pointer" : "hidden")}
                        onClick={() => {
                            setSelected(false);
                            setZoom(100);
                            setOffset({x: 0, y: 0});
                        }}
                    >
                        <img src="/icons/close.svg" className="w-full h-full" />
                    </div>
                </div>
            </div>
            <div
                className={clsx(selected ? "w-full rounded-lg bg-zinc-900 border border-zinc-700" : "hidden")}
                style={{ aspectRatio: aspectRatio }}
            ></div>
            <div className="text-white/80 text-sm font-light italic mx-4 my-2">
                {desc}
                {
                    origin &&
                    <span>
                        (<a href={origin}>Source</a>)
                    </span>
                }
            </div>
        </div>
    )
}

export { BlogLink, CodeBlock, ImageBlock }