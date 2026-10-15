import { useMemo, useState } from "react";
import ContactsHeader from "./ContactsHeader";
import ContactSearch from "./ContactSearch";
import ContactFilters from "./ContactFilters";
import ContactList from "./ContactList";
import BlockedList from "./BlockedList";
import AddContactModal from "../modals/AddContactModal";
import useChat from "../../hooks/useChat";
import useContacts from "../../hooks/useContacts";
import usePresence from "../../hooks/usePresence";
import useContactFilter from "../../hooks/useContactFilter";
import useContactActions from "../../hooks/useContactActions";

const EMPTY_TEXT = {
  all: "No contacts yet. Click + to add someone.",
  online: "Nobody is online right now.",
  favorites: "No favorites yet. Star a contact from its ⋮ menu.",
  blocked: "You haven't blocked anyone.",
};

export default function ContactsPanel() {
  const { contacts, blocked, loading } = useContacts();
  const { activeItem } = useChat();
  const { onlineIds, lastSeen } = usePresence();
  const actions = useContactActions();
  const [adding, setAdding] = useState(false);

  // attach live presence to every contact (hidden for people I blocked)
  const items = useMemo(
    () =>
      contacts.map((c) => ({
        ...c,
        status: c.blockedByMe ? undefined : onlineIds.has(c.user._id) ? "online" : "offline",
        lastSeen: c.blockedByMe ? null : lastSeen[c.user._id] ?? c.user.lastSeen,
      })),
    [contacts, onlineIds, lastSeen]
  );

  const { search, setSearch, filter, setFilter, filtered, filteredBlocked, counts } =
    useContactFilter(items, blocked);

  const showingBlocked = filter === "blocked";
  const shownCount = showingBlocked ? filteredBlocked.length : filtered.length;
  const totalForTab = counts[filter];

  return (
    <section className="flex min-h-0 w-full flex-1 flex-col bg-panel lg:h-dvh lg:w-[360px] lg:flex-none lg:shrink-0 lg:border-r lg:border-line">
      <ContactsHeader onAdd={() => setAdding(true)} />
      <ContactSearch value={search} onChange={setSearch} />
      <ContactFilters value={filter} onChange={setFilter} counts={counts} />

      <div className="thin-scroll flex-1 overflow-y-auto px-2 pb-4">
        {loading && <p className="px-3 py-4 text-sm text-muted">Loading contacts...</p>}

        {!loading && totalForTab === 0 && (
          <p className="px-3 py-4 text-sm text-muted">{EMPTY_TEXT[filter]}</p>
        )}

        {!loading && totalForTab > 0 && shownCount === 0 && (
          <p className="px-3 py-4 text-sm text-muted">No one matches your search.</p>
        )}

        {!loading &&
          (showingBlocked ? (
            <BlockedList people={filteredBlocked} onUnblock={actions.unblock} />
          ) : (
            <ContactList
              items={filtered}
              pinFavorites={filter === "all" && !search.trim()}
              activeUserId={activeItem?.other?._id}
              actions={actions}
              onOpen={actions.message}
            />
          ))}
      </div>

      {adding && <AddContactModal onClose={() => setAdding(false)} />}
    </section>
  );
}