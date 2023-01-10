// Copyright (c) 2015 - 2017 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
import test from 'tape-promise/tape';
import {getS2Polygon} from '@deck.gl/geo-layers/s2-layer/s2-utils';

import {convertS2BVtoOBB} from '@deck.gl/geo-layers';

const MAX_DISTANCE = 1e-13;

test.only('S2BV-OBB', async t => {
  const s2bv = {
    boundingVolume: {
      extensions: {
        '3DTILES_bounding_volume_S2': {
          token: '2c',
          minimumHeight: 0,
          maximumHeight: 500000
        }
      }
    }
  };

  const obb = convertS2BVtoOBB(s2bv);

  /*
        Compute points from s2bv. The same is being done in convertS2BVtoOBB, but points are not in the method's output.
        Then, check distances between points and the obb converted from s2bv
    */
  const s2 = s2bv.boundingVolume?.extensions?.['3DTILES_bounding_volume_S2'];
  const token = s2.token;
  const polygon = getS2Polygon(token);

  const points = [];
  if (polygon.length % 2 !== 0) {
    throw new Error('Invalid polygon');
  }
  const min = s2.minimumHeight;
  const max = s2.maximumHeight;
  for (let i = 0; i < polygon.length; i += 2) {
    const lng = polygon[i];
    const lat = polygon[i + 1];
    points.push([lng, lat, min]);
    points.push([lng, lat, max]);
  }

  for (const point of points) {
    const d = obb.distanceTo(point);
    t.ok(d < MAX_DISTANCE, `Point ${point} is out of the OBB. Distance=${d}`);
  }
  t.end();
});
