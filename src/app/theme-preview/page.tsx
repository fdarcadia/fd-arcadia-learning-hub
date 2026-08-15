"use client";

import {
  CheckCircle2,
  Coins,
  Gem,
  Star,
} from "lucide-react";

import {
  ArcadiaButton,
  ArcadiaCard,
  ArcadiaProgress,
  ArcadiaStat,
  ArcadiaTaskCard,
} from "@/components/ui/arcadia";

export default function ArcadiaThemePreviewPage() {
  return (
    <main className="arcadia-page py-8">
      <div className="arcadia-container">
        <div className="arcadia-game-shell p-4 sm:p-6">
          <div className="grid gap-5 lg:grid-cols-[250px_1fr_310px]">
            <aside className="arcadia-sidebar p-4">
              <p className="arcadia-eyebrow">FD Arcadia</p>
              <h1 className="mt-2 text-2xl font-black text-[#24213f]">
                LearningHub
              </h1>

              <div className="mt-6 space-y-2">
                <button className="arcadia-nav-item arcadia-nav-item-active w-full">
                  Home
                </button>
                <button className="arcadia-nav-item w-full">
                  Learning
                </button>
                <button className="arcadia-nav-item w-full">
                  Tasks
                </button>
                <button className="arcadia-nav-item w-full">
                  Virtual World
                </button>
                <button className="arcadia-nav-item w-full">
                  Progress
                </button>
              </div>

              <div className="arcadia-reward mt-6 p-4">
                <p className="text-sm font-black">Daily Reward</p>
                <p className="mt-1 text-xs opacity-75">
                  Come back tomorrow!
                </p>
              </div>
            </aside>

            <section className="space-y-5">
              <ArcadiaCard variant="large" className="p-6">
                <p className="arcadia-eyebrow">FD Arcadia LearningHub</p>

                <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <h2 className="arcadia-title">Welcome back, Noah</h2>
                    <p className="arcadia-subtitle mt-2">
                      Complete learning tasks to earn rewards for your virtual world.
                    </p>
                  </div>

                  <ArcadiaButton>
                    Continue Learning
                  </ArcadiaButton>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <ArcadiaStat
                    light
                    icon={<Coins className="text-amber-500" />}
                    label="Coins"
                    value={560}
                  />

                  <ArcadiaStat
                    light
                    icon={<Star className="fill-amber-400 text-amber-400" />}
                    label="Stars"
                    value={124}
                  />

                  <ArcadiaStat
                    light
                    icon={<Gem className="text-violet-500" />}
                    label="Gems"
                    value={18}
                  />
                </div>
              </ArcadiaCard>

              <div className="grid gap-5 md:grid-cols-2">
                <ArcadiaCard className="p-5">
                  <h3 className="text-lg font-black">Weekly Progress</h3>
                  <p className="mt-1 text-sm font-bold text-[#87859a]">
                    4 / 5 Tasks Completed
                  </p>

                  <ArcadiaProgress
                    value={80}
                    variant="green"
                    className="mt-4"
                  />

                  <div className="mt-4 flex items-center gap-3 rounded-[18px] bg-[#f7f5fc] p-4">
                    <CheckCircle2 className="text-emerald-500" />
                    <p className="text-sm font-bold text-[#55536b]">
                      Complete all tasks to unlock Mystery Box.
                    </p>
                  </div>
                </ArcadiaCard>

                <ArcadiaCard variant="purple" className="p-5">
                  <h3 className="text-lg font-black">Virtual World Reward</h3>
                  <p className="arcadia-subtitle mt-2">
                    Earn coins from learning and spend them on furniture, outfits and room items.
                  </p>

                  <ArcadiaButton
                    variant="teal"
                    className="mt-5"
                  >
                    Enter My Room
                  </ArcadiaButton>
                </ArcadiaCard>
              </div>
            </section>

            <aside>
              <ArcadiaCard className="p-5">
                <h3 className="text-lg font-black">Today's Tasks</h3>

                <div className="mt-4 space-y-3">
                  <ArcadiaTaskCard
                    completed
                    title="Jejak 3 huruf"
                    subtitle="3 / 3 selesai"
                    reward="+10 🪙"
                  />

                  <ArcadiaTaskCard
                    title="Baca 5 perkataan KV"
                    subtitle="4 / 5"
                    progress={80}
                    reward="+15 🪙"
                  />

                  <ArcadiaTaskCard
                    title="Selesaikan aktiviti Math"
                    subtitle="0 / 1"
                    progress={0}
                    reward="+20 🪙"
                  />
                </div>

                <ArcadiaButton className="mt-5 w-full">
                  Go to Learning
                </ArcadiaButton>
              </ArcadiaCard>
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
}
