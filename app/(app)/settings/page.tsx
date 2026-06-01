import { getSettings } from "@/lib/actions/settings";
import { SettingsForm } from "@/components/settings/settings-form";

export default async function SettingsPage() {
  const settings = await getSettings();

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Preferences for your budget tracker
        </p>
      </div>
      <SettingsForm
        initialCurrency={settings.currency}
        email={settings.email}
      />
    </div>
  );
}
