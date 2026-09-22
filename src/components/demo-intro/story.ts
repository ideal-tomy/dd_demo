export type Camera = readonly [number, number, number];
export type DeviceId = "exit" | "axis" | "ask";

export const scenes: {
  title: string;
  caption: string;
  duration: number;
  camera: Camera;
  stars: readonly DeviceId[];
}[] = [
  {
    title: "EXITを見る",
    caption: "サンプル企業のEXIT試算が並びます。",
    duration: 5000,
    camera: [264, 175, 1.02],
    stars: ["exit"],
  },
  {
    title: "主軸へ",
    caption: "主軸を変えると、株式価値が動きます。",
    duration: 4500,
    camera: [516, 175, 0.9],
    stars: ["exit", "axis"],
  },
  {
    title: "主軸を選ぶ",
    caption: "効率化・整理・戦略の3つから選びます。",
    duration: 5500,
    camera: [768, 175, 1.0],
    stars: ["axis"],
  },
  {
    title: "処置が変わる",
    caption: "簿外の処置の書き方が、主軸に合わせて変わります。",
    duration: 5500,
    camera: [768, 175, 1.0],
    stars: ["axis"],
  },
  {
    title: "問いへ",
    caption: "判断の問いと、返した時間が出ます。",
    duration: 4500,
    camera: [1020, 175, 0.9],
    stars: ["axis", "ask"],
  },
  {
    title: "人が考える",
    caption: "人が考える問いが残ります。提出はしません。",
    duration: 5500,
    camera: [1272, 175, 0.98],
    stars: ["ask"],
  },
];

export const totalDuration = scenes.reduce((sum, scene) => sum + scene.duration, 0);

export function storyFrame(time: number) {
  let elapsed = ((time % totalDuration) + totalDuration) % totalDuration;
  let index = 0;
  while (index < scenes.length - 1 && elapsed >= scenes[index].duration) {
    elapsed -= scenes[index++].duration;
  }
  const previous = scenes[index === 0 ? 0 : index - 1];
  const next = scenes[index];
  const t = Math.min(1, elapsed / 1200);
  const ease = t * t * (3 - 2 * t);
  const camera = next.camera.map(
    (value, i) => previous.camera[i] + (value - previous.camera[i]) * ease,
  ) as unknown as Camera;
  return { index, elapsed, camera, stars: next.stars, previousStars: previous.stars, ease };
}
