import { Switch } from "~/components/ui/switch";

interface Props {
  enabled: boolean;
  onChange: (newValue: boolean) => void;
}
export const ChannelNotificationsToggle = ({ enabled, onChange }: Props) => (
  <Switch checked={enabled} onChange={(e) => onChange(!!e.currentTarget.value)}>{`Notifications ${
    enabled ? "On" : "Off"
  }`}</Switch>
);
