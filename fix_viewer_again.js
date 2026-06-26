const fs = require('fs');

let viewerPath = 'app/components/ModelViewer.tsx';
let viewerContent = fs.readFileSync(viewerPath, 'utf8');

viewerContent = viewerContent.replace(/transform\.posX/g, 'transform.position.x');
viewerContent = viewerContent.replace(/transform\.posY/g, 'transform.position.y');
viewerContent = viewerContent.replace(/transform\.posZ/g, 'transform.position.z');
viewerContent = viewerContent.replace(/transform\.rotX/g, 'transform.rotation.x');
viewerContent = viewerContent.replace(/transform\.rotY/g, 'transform.rotation.y');
viewerContent = viewerContent.replace(/transform\.rotZ/g, 'transform.rotation.z');

// Replace D_POINT with D_POINT1, etc.
viewerContent = viewerContent.replace(/D_POINT,/g, 'D_POINT1,\n  D_POINT2,');
viewerContent = viewerContent.replace(/D_SPOT,/g, 'D_SPOT1,\n  D_SPOT2,');
viewerContent = viewerContent.replace(/point=\{D_POINT\}/g, 'point1={D_POINT1}\n          point2={D_POINT2}');
viewerContent = viewerContent.replace(/spot=\{D_SPOT\}/g, 'spot1={D_SPOT1}\n          spot2={D_SPOT2}');

// Replace SceneLights renderConfig correctly
viewerContent = viewerContent.replace(/renderConfig=\{D_RENDER\}\n\s*\/>/g, 'renderConfig={D_RENDER}\n          modelPosition={D_TRANSFORM.position}\n        />');


viewerContent = viewerContent.replace(/camera\.posX/g, 'camera.position.x');
viewerContent = viewerContent.replace(/camera\.posY/g, 'camera.position.y');
viewerContent = viewerContent.replace(/camera\.posZ/g, 'camera.position.z');
viewerContent = viewerContent.replace(/D_CAMERA\.posX/g, 'D_CAMERA.position.x');
viewerContent = viewerContent.replace(/D_CAMERA\.posY/g, 'D_CAMERA.position.y');
viewerContent = viewerContent.replace(/D_CAMERA\.posZ/g, 'D_CAMERA.position.z');

// Scale fix
viewerContent = viewerContent.replace(/scale=\{transform\.scale\}/, 'scale={[transform.scale.x, transform.scale.y, transform.scale.z]}');

fs.writeFileSync(viewerPath, viewerContent);
