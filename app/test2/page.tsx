// Approach 2: CSS Blur & Material Fading. This approach applies a CSS backdrop-filter to an HTML element overlay to blur the background image, and directly manipulates the opacity of the box model's materials over time to simulate it fading away behind the blur, offering a potentially more performant solution.
import Approach2 from "@/components/test/Approach2";

export default function TestPage2() {
  return <Approach2 />;
}
