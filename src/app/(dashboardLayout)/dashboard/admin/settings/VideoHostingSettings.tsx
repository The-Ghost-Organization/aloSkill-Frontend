"use client";
import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '@/lib/api/client';
import type { HostingPolicy } from '@/lib/course/videoHosting';

interface Settings extends HostingPolicy {
  connected: boolean; channelTitle: string | null; channelId: string | null; lastError: string | null;
  premiumConfigured: boolean; signedPlaybackConfigured: boolean;
  counts: { provider: string; status: string; _count: number }[];
  failed: { id: string; fileName: string; uploadError: string | null }[];
  playlistFailures: { id: string; title: string; playlistSyncError: string | null }[];
}
export default function VideoHostingSettings() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const load = useCallback(async () => {
    const response = await apiClient.get<Settings>('/course/video/admin');
    if (response.data) setSettings(response.data);
    else setMessage(response.message ?? 'Could not load video settings.');
  }, []);
  useEffect(() => { void load(); }, [load]);
  async function connect() {
    setBusy(true);
    const response = await apiClient.post<{ url: string }>('/course/video/admin/connect');
    if (response.data) window.location.assign(response.data.url);
    else setMessage(response.message ?? 'Authorization could not start.');
    setBusy(false);
  }
  async function save() {
    if (!settings) return;
    setBusy(true);
    const { defaultHosting, allowFreePaid, freeEnabled, premiumEnabled, maxUploadBytes, allowedMimeTypes } = settings;
    const response = await apiClient.patch('/course/video/admin', { defaultHosting, allowFreePaid, freeEnabled, premiumEnabled, maxUploadBytes, allowedMimeTypes });
    setMessage(response.message ?? 'Settings saved.'); setBusy(false);
  }
  const inputClass = 'rounded border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100';
  return <section className='mb-5 rounded-2xl border border-slate-800 bg-slate-900 p-6 text-slate-100'>
    <h2 className='mb-4 text-lg font-bold'>Video Hosting</h2>
    {message && <p role='status' className='mb-4 text-sm text-orange-300'>{message}</p>}
    {!settings ? <p>Loading hosting configuration…</p> : <>
      <div className='grid gap-5 md:grid-cols-2'>
        <div><h3 className='font-semibold'>Free Hosting configuration</h3>
          <p className='my-2 text-sm'>YouTube OAuth: {settings.connected ? `Connected to ${settings.channelTitle} (${settings.channelId})` : 'Not connected'}</p>
          <p className='text-sm text-slate-400'>Course playlist privacy: Private. Video privacy: Unlisted. Credentials are managed on the server.</p>
          <button disabled={busy} onClick={() => void connect()} className={`${inputClass} mt-3`}>{settings.connected ? 'Reconnect central YouTube account' : 'Connect central YouTube account'}</button>
          {settings.lastError && <p className='mt-2 text-sm text-red-300'>Last provider error: {settings.lastError}</p>}
          <p className='mt-2 text-xs text-slate-400'>Actual quota usage is available in Google Cloud Console. Rate and quota errors appear here.</p>
        </div>
        <div><h3 className='font-semibold'>Premium Hosting configuration</h3>
          <p className='my-2 text-sm'>Bunny configuration: {settings.premiumConfigured ? 'Configured' : 'Missing server configuration'}</p>
          <p className='text-sm'>Signed playback: {settings.signedPlaybackConfigured ? 'Configured' : 'Missing signing key'}</p>
          <p className='mt-2 text-xs text-slate-400'>Processing results below indicate provider health. Configuration does not confirm a live connection.</p>
        </div>
      </div>
      <fieldset disabled={busy} className='my-5 grid gap-4 sm:grid-cols-2'>
        <legend className='mb-3 font-semibold'>Platform policies</legend>
        <label className='flex flex-col gap-2 text-sm'>Default hosting preference<select className={inputClass} value={settings.defaultHosting} onChange={e => setSettings({ ...settings, defaultHosting: e.target.value as 'FREE' | 'PREMIUM' })}><option value='FREE'>Free Hosting</option><option value='PREMIUM'>Premium Hosting</option></select></label>
        <label className='flex flex-col gap-2 text-sm'>Maximum file size (MB)<input type='number' min={1} max={1907} className={inputClass} value={Math.floor(settings.maxUploadBytes / 1048576)} onChange={e => setSettings({ ...settings, maxUploadBytes: Number(e.target.value) * 1048576 })} /></label>
        {(['freeEnabled', 'premiumEnabled', 'allowFreePaid'] as const).map(key => <label key={key} className='flex gap-2 text-sm'><input type='checkbox' checked={settings[key]} onChange={e => setSettings({ ...settings, [key]: e.target.checked })} />{{ freeEnabled: 'Enable Free Hosting', premiumEnabled: 'Enable Premium Hosting', allowFreePaid: 'Allow Free Hosting for paid lessons' }[key]}</label>)}
        <div className='text-sm'>Allowed formats{(['video/mp4', 'video/quicktime', 'video/webm'] as const).map(mime => <label key={mime} className='mt-2 flex gap-2'><input type='checkbox' checked={settings.allowedMimeTypes.includes(mime)} onChange={e => setSettings({ ...settings, allowedMimeTypes: e.target.checked ? [...settings.allowedMimeTypes, mime] : settings.allowedMimeTypes.filter(v => v !== mime) })} />{mime}</label>)}</div>
      </fieldset>
      <div className='flex gap-3'><button disabled={busy} onClick={() => void save()} className='rounded bg-orange-600 px-4 py-2 text-sm'>Save hosting settings</button><button onClick={() => void load()} className={inputClass}>Refresh health</button></div>
      <div className='mt-5 overflow-x-auto'><table className='w-full text-left text-xs'><caption className='mb-2 text-left font-semibold'>Upload and processing health</caption><thead><tr><th>Provider</th><th>Status</th><th>Jobs</th></tr></thead><tbody>{settings.counts.map(row => <tr key={`${row.provider}-${row.status}`}><td className='py-2'>{row.provider}</td><td>{row.status}</td><td>{row._count}</td></tr>)}</tbody></table></div>
      <h3 className='mt-4 font-semibold'>Failed uploads</h3>
      {settings.failed.length ? settings.failed.map(job => <div key={job.id} className='mt-2 text-xs'><p>{job.fileName}: {job.uploadError}</p><button className='underline' onClick={async () => { await apiClient.post(`/course/video/uploads/${job.id}/retry`); await load(); }}>Retry upload</button></div>) : <p className='text-sm text-slate-400'>No failed uploads.</p>}
      <h3 className='mt-4 font-semibold'>Playlist synchronization</h3>
      {settings.playlistFailures.length ? settings.playlistFailures.map(course => <p key={course.id} className='mt-2 text-xs text-orange-300'>{course.title}: {course.playlistSyncError}. The worker retries independently of video uploads.</p>) : <p className='text-sm text-slate-400'>No recorded synchronization failures.</p>}
    </>}
  </section>;
}
