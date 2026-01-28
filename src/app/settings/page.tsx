import MainLayout from "@/components/MainLayout";

export default function Settings() {
  return (
    <MainLayout
      title="Settings"
      subtitle="Configure middleware server, security and integrations"
    >
      <section className="row">
        <div className="card col-6">
          <h3>Server</h3>
          <p className="sub">Core middleware server settings</p>

          <div className="mt-12 display-flex-col">
            <label className="text-muted label-sm">Hostname</label>
            <input defaultValue="middleware-01" />

            <label className="text-muted label-sm">Bind Address</label>
            <input defaultValue="0.0.0.0:1883" />

            <label className="text-muted label-sm">Region</label>
            <select>
              <option>Dhaka</option>
              <option>London</option>
              <option>Singapore</option>
            </select>

            <div className="inline-center mt-8">
              <button className="btn">Save Server</button>
              <button className="btn ghost">Restart</button>
            </div>
          </div>
        </div>

        <div className="card col-6">
          <h3>Security</h3>
          <p className="sub">Authentication and TLS settings</p>

          <div className="mt-12 display-flex-col">
            <label className="text-muted label-sm">Auth Mode</label>
            <select>
              <option>Password</option>
              <option>Token</option>
              <option>None</option>
            </select>

            <label className="text-muted label-sm">TLS</label>
            <div className="inline-center gap-8">
              <button className="btn ghost">Enable</button>
              <button className="btn ghost">Upload Cert</button>
            </div>

            <div className="mt-8 text-muted label-sm">
              API Keys: <strong className="text-primary">3</strong>
            </div>
          </div>
        </div>

        <div className="card col-6">
          <h3>Logging</h3>
          <p className="sub">Rotation, retention and levels</p>

          <div className="mt-12 display-flex-col">
            <label className="text-muted label-sm">Level</label>
            <select>
              <option>Info</option>
              <option>Debug</option>
              <option>Warn</option>
              <option>Error</option>
            </select>

            <label className="text-muted label-sm">Retention (days)</label>
            <input defaultValue="30" />

            <div className="inline-center mt-8">
              <button className="btn">Save Logging</button>
              <button className="btn ghost">Rotate Now</button>
            </div>
          </div>
        </div>

        <div className="card col-6">
          <h3>Integrations</h3>
          <p className="sub">External systems and webhooks</p>

          <div className="mt-12 display-flex-col">
            <label className="text-muted label-sm">Webhook URL</label>
            <input placeholder="https://hooks.example.com/iot" />

            <label className="text-muted label-sm">MQTT Bridge</label>
            <select>
              <option>Disabled</option>
              <option>Enabled</option>
            </select>

            <div className="inline-center mt-8">
              <button className="btn">Save Integrations</button>
            </div>
          </div>
        </div>

        <div className="card col-12">
          <h3>Advanced</h3>
          <p className="sub">Raw configuration (YAML)</p>
          <textarea
            placeholder="# paste YAML here"
            className="min-h-160 mt-10 mono"
          ></textarea>

          <div className="justify-end mt-10">
            <button className="btn ghost">Reset to Defaults</button>
            <button className="btn">Apply Config</button>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div>© 2025 Middleware Lab</div>
        <div className="text-muted">
          Built for IoT control • Dark Lime theme
        </div>
      </footer>
    </MainLayout>
  );
}
