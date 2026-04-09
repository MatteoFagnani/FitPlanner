"use client";

import { useMemo, useState } from "react";
import MaterialIcon from "@/components/icons/MaterialIcon";
import { User } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ProgramAudiencePickerProps {
  users: User[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export default function ProgramAudiencePicker({
  users,
  selectedIds,
  onChange,
}: ProgramAudiencePickerProps) {
  const [query, setQuery] = useState("");

  const availableUsers = useMemo(
    () =>
      [...users].sort((left, right) => {
        if (left.role !== right.role) {
          return left.role === "coach" ? -1 : 1;
        }

        return left.name.localeCompare(right.name);
      }),
    [users]
  );

  const filteredUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return availableUsers;
    }

    return availableUsers.filter((user) =>
      `${user.name} ${user.email}`.toLowerCase().includes(normalizedQuery)
    );
  }, [availableUsers, query]);

  const selectedUsers = availableUsers.filter((user) => selectedIds.includes(user.id));

  const toggleUser = (userId: string) => {
    if (selectedIds.includes(userId)) {
      onChange(selectedIds.filter((id) => id !== userId));
      return;
    }

    onChange([...selectedIds, userId]);
  };

  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-outline">
        <MaterialIcon name="group_add" className="text-sm" />
        Condividi Con
      </label>

      <div className="rounded-[1.5rem] border border-outline-variant/80 bg-white p-3 shadow-sm">
        <div className="flex items-center gap-2 rounded-2xl border border-outline-variant bg-surface-container-lowest px-3 py-3">
          <MaterialIcon name="search" className="text-base text-outline" />
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cerca coach o atleta"
            className="w-full min-w-0 bg-transparent text-sm font-medium outline-none placeholder:text-outline/50"
          />
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {selectedUsers.length === 0 && (
            <p className="text-xs font-medium text-outline">
              Nessun utente selezionato.
            </p>
          )}

          {selectedUsers.map((user) => (
            <button
              key={user.id}
              type="button"
              onClick={() => toggleUser(user.id)}
              className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-[11px] font-bold text-primary"
            >
              <span className="truncate">{user.name}</span>
              <span className="rounded-full bg-white/80 px-2 py-0.5 text-[9px] uppercase tracking-[0.16em] text-outline">
                {user.role}
              </span>
              <MaterialIcon name="close" className="text-sm" />
            </button>
          ))}
        </div>

        <div className="mt-3 max-h-72 space-y-2 overflow-y-auto pr-1">
          {filteredUsers.map((user) => {
            const isSelected = selectedIds.includes(user.id);

            return (
              <button
                key={user.id}
                type="button"
                onClick={() => toggleUser(user.id)}
                className={cn(
                  "flex w-full items-center justify-between rounded-2xl border px-3 py-3 text-left transition-all",
                  isSelected
                    ? "border-primary/30 bg-primary/5"
                    : "border-outline-variant/70 bg-surface-container-lowest"
                )}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-bold text-on-surface">{user.name}</p>
                    <span className="rounded-full bg-white px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.16em] text-outline">
                      {user.role}
                    </span>
                  </div>
                  <p className="truncate text-[11px] text-outline">{user.email}</p>
                </div>
                <div
                  className={cn(
                    "ml-3 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border",
                    isSelected
                      ? "border-primary bg-primary text-white"
                      : "border-outline-variant text-outline"
                  )}
                >
                  <MaterialIcon name={isSelected ? "done" : "add"} className="text-sm" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
