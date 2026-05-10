import React from "react";
import { stats } from "./workProofData";

const WorkProofStats = () => {
    return (
        <section className="w-full px-4 sm:px-6 md:px-12 py-10 sm:py-14">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 max-w-5xl mx-auto">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div
                            key={stat.label}
                            className="group relative rounded-2xl border border-white/40 bg-white/70 backdrop-blur-md p-6 text-center transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-dark/5"
                        >
                            {/* Icon */}
                            <div
                                className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${stat.bg} ${stat.color} transition-transform duration-300 group-hover:scale-110`}
                            >
                                <Icon className="h-5 w-5" />
                            </div>

                            {/* Value */}
                            <h3 className="mt-4 text-3xl sm:text-4xl font-black tracking-tight bg-clip-text text-transparent bg-linear-to-r from-tertiary to-[#8B5CF6]">
                                {stat.value}
                            </h3>

                            {/* Label */}
                            <p className="mt-1.5 text-sm font-semibold text-dark/55">
                                {stat.label}
                            </p>
                        </div>
                    );
                })}
            </div>
        </section>
    );
};

export default WorkProofStats;
