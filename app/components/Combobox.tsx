import { Combobox as HeadlessCombobox } from "@headlessui/react";
import * as React from "react";
import Fuse from "fuse.js";
import clsx from "clsx";
import type { Unpacked } from "~/utils/types";
import { useFetcher } from "@remix-run/react";
import type { UsersLoaderData } from "~/routes/users";
import type { User } from "~/db/types";

const MAX_RESULTS_SHOWN = 6;

type ComboboxOption<T> = { label: string; value: string } & T;
interface ComboboxProps<T> {
  options: ComboboxOption<T>[];
  inputName: string;
  placeholder: string;
  isLoading?: boolean;
  onChange?: (selectedOption?: ComboboxOption<T>) => void;
}

export function Combobox<T extends Record<string, string | null | number>>({
  options,
  inputName,
  placeholder,
  onChange,
  isLoading = false,
}: ComboboxProps<T>) {
  const [selectedOption, setSelectedOption] =
    React.useState<Unpacked<typeof options>>();
  const [query, setQuery] = React.useState("");

  const filteredOptions = (() => {
    if (!query) return [];

    const fuse = new Fuse(options, {
      keys: [...Object.keys(options[0])],
    });
    return fuse
      .search(query)
      .slice(0, MAX_RESULTS_SHOWN)
      .map((res) => res.item);
  })();

  const noMatches = filteredOptions.length === 0;

  return (
    <HeadlessCombobox
      value={selectedOption}
      onChange={(selected) => {
        onChange?.(selected);
        setSelectedOption(selected);
      }}
      name={inputName}
      disabled={isLoading}
    >
      <HeadlessCombobox.Input
        onChange={(event) => setQuery(event.target.value)}
        placeholder={isLoading ? "Loading..." : placeholder}
        className="combobox-input"
        displayValue={(option) =>
          (option as Unpacked<typeof options>)?.label ?? ""
        }
        data-cy={`${inputName}-combobox-input`}
      />
      <HeadlessCombobox.Options
        className={clsx("combobox-options", {
          empty: noMatches,
          hidden: !query,
        })}
      >
        {noMatches ? (
          <div className="combobox-no-matches">
            No matches found <span className="combobox-emoji">🤔</span>
          </div>
        ) : (
          filteredOptions.map((option) => (
            <HeadlessCombobox.Option
              key={option.value}
              value={option}
              as={React.Fragment}
            >
              {({ active }) => (
                <li className={clsx("combobox-item", { active })}>
                  {option.label}
                </li>
              )}
            </HeadlessCombobox.Option>
          ))
        )}
      </HeadlessCombobox.Options>
    </HeadlessCombobox>
  );
}

// TODO: if we search with only discord id "79237403620945920" then doesn't really make sense to do fuzzy search
export function UserCombobox({
  inputName,
  onChange,
}: Pick<
  ComboboxProps<Pick<User, "discordId" | "plusTier">>,
  "inputName" | "onChange"
>) {
  const fetcher = useFetcher<UsersLoaderData>();

  React.useEffect(() => {
    if (fetcher.type === "init") fetcher.load("/users");
  }, [fetcher]);

  const isLoading = fetcher.type !== "done";

  return (
    <Combobox
      inputName={inputName}
      options={
        isLoading
          ? []
          : fetcher.data.users.map((u) => ({
              label: u.discordFullName,
              value: String(u.id),
              discordId: u.discordId,
              plusTier: u.plusTier,
            }))
      }
      placeholder="Sendou#0043"
      isLoading={isLoading}
      onChange={onChange}
    />
  );
}