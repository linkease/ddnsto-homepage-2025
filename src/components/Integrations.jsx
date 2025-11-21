import React from 'react';

const apps = [
    { name: 'Home Assistant', color: '#03A9F4' },
    { name: 'Jellyfin', color: '#AA5CC3' },
    { name: 'PhotoPrism', color: '#E4A6C5' },
    { name: 'Gitea', color: '#609926' },
    { name: 'qBittorrent', color: '#2F67BA' },
    { name: 'Vaultwarden', color: '#175DDC' },
    { name: 'Plex', color: '#E5A00D' },
    { name: 'Nextcloud', color: '#0082C9' },
];

const Integrations = () => {
    return (
        <section className="py-24 bg-brand-surface/30 border-y border-white/5 overflow-hidden">
            <div className="container mx-auto px-6 max-w-6xl text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-12">
                    Works Seamlessly with <span className="text-brand-secondary">Your Favorite Apps</span>
                </h2>

                <div className="flex flex-wrap justify-center gap-8 md:gap-12">
                    {apps.map((app, idx) => (
                        <div key={idx} className="group flex flex-col items-center gap-3">
                            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-brand-surface border border-white/10 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:border-white/30 shadow-xl">
                                {/* Placeholder for actual icons, using initials/colors */}
                                <div className="text-2xl font-bold" style={{ color: app.color }}>
                                    {app.name.substring(0, 2)}
                                </div>
                            </div>
                            <span className="text-sm font-medium text-gray-400 group-hover:text-white transition-colors">
                                {app.name}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Integrations;
