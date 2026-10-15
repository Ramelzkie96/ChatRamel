import { useMemo, useState } from "react";
import GroupsHeader from "./GroupsHeader";
import GroupSearch from "./GroupSearch";
import GroupFilters from "./GroupFilters";
import GroupListItem from "./GroupListItem";
import NewGroupModal from "../modals/NewGroupModal";
import useChat from "../../hooks/useChat";
import useGroupFilter from "../../hooks/useGroupFilter";

export default function GroupsPanel() {
  const { items, activeChatId, selectChat, loadingChats } = useChat();
  const [creating, setCreating] = useState(false);

  const groups = useMemo(() => items.filter((c) => c.isGroup), [items]);
  const { search, setSearch, filter, setFilter, filtered, total } = useGroupFilter(groups);

  return (
    <section className="flex h-screen w-[360px] shrink-0 flex-col border-r border-line bg-panel">
      <GroupsHeader onNew={() => setCreating(true)} />
      <GroupSearch value={search} onChange={setSearch} />
      <GroupFilters value={filter} onChange={setFilter} total={total} />

      <div className="thin-scroll flex-1 overflow-y-auto px-2 pb-4">
        {loadingChats && <p className="px-3 py-4 text-sm text-muted">Loading groups...</p>}

        {!loadingChats && total === 0 && (
          <p className="px-3 py-4 text-sm text-muted">No groups yet. Click + to create one.</p>
        )}

        {total > 0 && filtered.length === 0 && (
          <p className="px-3 py-4 text-sm text-muted">No groups match your search.</p>
        )}

        <div className="flex flex-col gap-1">
          {filtered.map((chat) => (
            <GroupListItem
              key={chat.id}
              chat={chat}
              active={activeChatId === chat.id}
              onClick={() => selectChat(chat.id)}
            />
          ))}
        </div>
      </div>

      {creating && <NewGroupModal onClose={() => setCreating(false)} />}
    </section>
  );
}