// Approach 1: 3D Transmission Plane. This approach uses a 3D plane with MeshTransmissionMaterial placed between the wand and the box in the 3D scene. This creates a realistic frosted glass effect that blurs the objects behind it (the box and the scene background).
import Approach1 from "@/components/test/Approach1";

export default function TestPage() {
  return <Approach1 />;
}
