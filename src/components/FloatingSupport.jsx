import React from 'react';

const FloatingSupport = () => {
    return (
        <div className="fixed right-4 bottom-6 z-[60] md:right-8 md:bottom-8">
            <div className="group relative">
                <div
                    className="pointer-events-none absolute right-[calc(100%+14px)] bottom-0 w-[276px] rounded-lg border border-gray-100 bg-white p-3 opacity-0 shadow-2xl shadow-black/30 transition-all duration-200 ease-out translate-x-2 group-hover:pointer-events-auto group-hover:translate-x-0 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:translate-x-0 group-focus-within:opacity-100"
                    role="tooltip"
                >
                    <p className="text-center text-xl font-semibold leading-none text-gray-900">
                        在线微信客服
                    </p>
                    <p className="mt-3 whitespace-nowrap text-center text-sm leading-6 text-gray-500">
                        在线时间：工作日13:30～18:00
                    </p>
                    <img
                        src="/wxqr.png"
                        alt="微信客服二维码"
                        className="mx-auto mt-4 block w-[248px] rounded-md"
                    />
                    <span className="absolute right-[-6px] bottom-5 h-3 w-3 rotate-45 border-r border-t border-gray-100 bg-white" />
                </div>

                <button
                    type="button"
                    className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-[#8490b8] shadow-[0_0_20px_rgba(132,144,184,0.36)] transition-transform duration-200 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-[#8490b8] focus:ring-offset-2 focus:ring-offset-brand-dark md:h-16 md:w-16"
                    aria-label="微信客服"
                >
                    <img
                        src="/serveUser.png"
                        alt=""
                        className="h-full w-full object-cover"
                        aria-hidden="true"
                    />
                </button>
            </div>
        </div>
    );
};

export default FloatingSupport;
