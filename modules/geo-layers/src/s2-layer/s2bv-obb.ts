import {getS2Polygon} from './s2-utils';
import {Vector3} from '@math.gl/core';
import {OrientedBoundingBox, makeOrientedBoundingBoxFromPoints} from '@math.gl/culling';

export type S2BoundingVolume = {
  boundingVolume: {
    extensions: {
      '3DTILES_bounding_volume_S2': {
        token: string;
        minimumHeight: number;
        maximumHeight: number;
      };
    };
  };
};

/**
 * Converts S2BoundingVolume to OrientedBoundingBox
 * @param {} s2bv - S2BoundingVolume which has the following structure:
 * {
 *    "boundingVolume": {
 *        "extensions": {
 *            "3DTILES_bounding_volume_S2": {
 *                "token": "2c",
 *                "minimumHeight": 0,
 *                "maximumHeight": 500000
 *            }
 *        }
 *    }
 *   };
 * @param {Object} options - loader options
 * @returns {GeoidHeightModel} - instance of GeoidHeightModel class
 */

export function convertS2BVtoOBB(
  s2bv: S2BoundingVolume,
  result?: OrientedBoundingBox | undefined
): OrientedBoundingBox {
  const s2 = s2bv.boundingVolume?.extensions?.['3DTILES_bounding_volume_S2'];
  const token = s2.token;
  const polygon = getS2Polygon(token);

  const points: Vector3[] = [];
  if (polygon.length % 2 !== 0) {
    throw new Error('Invalid polygon');
  }
  const min: number = s2.minimumHeight;
  const max: number = s2.maximumHeight;
  for (let i = 0; i < polygon.length; i += 2) {
    const lng: number = polygon[i];
    const lat: number = polygon[i + 1];
    points.push(new Vector3(lng, lat, min));
    points.push(new Vector3(lng, lat, max));
  }

  result = makeOrientedBoundingBoxFromPoints(points, result);
  /*
    for (const point of points) {
        const d = result.distanceTo(point);
        if (d !== 0) {
            console.log(`Point ${point} is out of the OBB. Distance=${d}`);
        }
    }
*/

  /*
    // math.gl\modules\culling\test\lib\algorithms\bounding-box-from-points.spec.ts 
    
    test('makeOrientedBoundingBoxFromPoints', (t) => {
      const boundingBox = makeOrientedBoundingBoxFromPoints(testPoints);
      for (const point of testPoints) {
        t.ok(equals(boundingBox.distanceTo(point), 0), 'point is inside the bounding box');
      }
      t.end();
    });
    */

  return result;
}
