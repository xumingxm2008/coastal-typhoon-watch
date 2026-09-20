const dialog = document.querySelector('#warning-dialog');
document.querySelector('[data-dialog="warning-dialog"]').addEventListener('click', () => dialog.showModal());
document.querySelector('[data-close]').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });

const setText = (id, value) => { document.querySelector(`#${id}`).textContent = value; };
const coord = (value, north, south) => `${Math.abs(value).toFixed(1)}°${value >= 0 ? north : south}`;
const time = (value) => value ? value.replace(/^\d{4}-/, '').replace(':00', '') : '—';
const allPoints = (storm) => [...storm.past, storm.current, ...storm.forecast];

function drawTrack(storm) {
  const points = allPoints(storm).filter((point) => point.lat !== null && point.lng !== null);
  if (!points.length) return;
  const layer = document.querySelector('#track-layer');
  const minLng = Math.min(...points.map((point) => point.lng)), maxLng = Math.max(...points.map((point) => point.lng));
  const minLat = Math.min(...points.map((point) => point.lat)), maxLat = Math.max(...points.map((point) => point.lat));
  const x = (point) => 80 + ((point.lng - minLng) / (maxLng - minLng || 1)) * 740;
  const y = (point) => 355 - ((point.lat - minLat) / (maxLat - minLat || 1)) * 280;
  const path = (items) => items.map((point, index) => `${index ? 'L' : 'M'} ${x(point).toFixed(1)} ${y(point).toFixed(1)}`).join(' ');
  const observed = [...storm.past, storm.current];
  const forecast = [storm.current, ...storm.forecast];
  const circles = points.map((point) => `<circle cx="${x(point)}" cy="${y(point)}" r="7" fill="#fff" stroke="#0d7b88" stroke-width="4"/>`).join('');
  layer.innerHTML = `<path d="${path(observed)}" fill="none" stroke="#0d7b88" stroke-width="7" stroke-linecap="round"/><path d="${path(forecast)}" fill="none" stroke="#0d7b88" stroke-width="7" stroke-dasharray="4 16" stroke-linecap="round"/>${circles}<g transform="translate(${x(storm.current)} ${y(storm.current)})"><circle r="32" fill="#e6ae25" opacity=".25"/><circle r="19" fill="#e6ae25"/><circle r="6" fill="#fff"/></g>`;
}

function render(storm, data) {
  const current = storm.current;
  setText('page-title', `台风“${storm.name}”`);
  setText('storm-id', `${storm.id} · ${storm.enName || '—'} · 路径资料来源：${data.source}`);
  setText('updated-at', `资料时间 ${time(current.time)} · 本站抓取 ${new Date(data.fetchedAt).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false })}`);
  setText('location-value', `${coord(current.lat, 'N', 'S')} · ${coord(current.lng, 'E', 'W')}`);
  setText('location-detail', `浙江系统资料时间：${time(current.time)}`);
  setText('direction-value', current.direction ? `向${current.direction}方向` : '暂无移动方向资料');
  setText('direction-detail', current.speed === null ? '暂无移动速度资料' : `约 ${current.speed} km/h`);
  setText('wind-value', current.wind === null ? '暂无风力资料' : `${current.wind} 级`);
  setText('wind-detail', `${current.strong || '强度资料待补充'}${current.pressure === null ? '' : ` · ${current.pressure} hPa`}`);
  setText('track-source', `路径资料 · ${data.source}${storm.forecastAgency ? ` · 预报台：${storm.forecastAgency}` : ''}`);
  document.querySelector('#track-list').innerHTML = allPoints(storm).slice(-6).map((point) => `<div><time>${time(point.time)}</time><b class="${point.phase === 'forecast' ? 'forecast' : ''}">${point.phase === 'forecast' ? '预报' : point.phase === 'past' ? '历史' : '实况'}</b><span>${coord(point.lat, 'N', 'S')} · ${coord(point.lng, 'E', 'W')}</span><strong>${point.wind === null ? '—' : `${point.wind}级`}</strong></div>`).join('');
  drawTrack(storm);
  document.querySelector('#data-status').innerHTML = '<span aria-hidden="true">●</span> 台风路径为浙江省台风路径实时发布系统资料；本站每 15 分钟尝试更新。预警信息目前仍为演示内容。';
}

async function loadData() {
  try {
    const response = await fetch('data/typhoon.json', { cache: 'no-store' });
    const data = await response.json();
    if (!data.active || !data.storms?.length) throw new Error('当前无活动台风');
    render(data.storms[0], data);
  } catch {
    setText('page-title', '当前无活动台风');
    setText('storm-id', '浙江省台风路径实时发布系统资料');
    setText('updated-at', '暂无可展示的活动台风资料');
    document.querySelector('#data-status').innerHTML = '<span aria-hidden="true">●</span> 暂无活动台风资料或数据暂不可用。预警信息目前仍为演示内容。';
    document.querySelector('#track-list').innerHTML = '<div><span>当前无活动台风，路径将在数据源出现活动台风后自动更新。</span></div>';
  }
}

loadData();
