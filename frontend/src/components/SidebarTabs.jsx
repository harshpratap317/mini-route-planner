const tabs = [
  { id: "overview", label: "Overview" },
  { id: "rides", label: "Rides" },
  { id: "explore", label: "Explore" },
  { id: "saved", label: "Saved" },
  { id: "history", label: "History" }
];

function SidebarTabs({ activeTab, onTabChange }) {
  return (
    <div className="sidebar-tabs" role="tablist" aria-label="Trip panels">
      {tabs.map((tab) => (
        <button
          type="button"
          key={tab.id}
          className={activeTab === tab.id ? "sidebar-tab sidebar-tab--active" : "sidebar-tab"}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export default SidebarTabs;
