import SettingsSidebar from "@/components/settings/SettingsSidebar";

const SettingsLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="content-area-scroll flex">
      <SettingsSidebar />
      <div className="content-area-container_sm flex-1 min-w-0">{children}</div>
    </div>
  );
};

export default SettingsLayout;
