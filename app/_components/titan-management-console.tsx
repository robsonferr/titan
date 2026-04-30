import {
  attachRewardToQuestAction,
  createQuestAction,
  createQuestProgressOptionAction,
  createRewardAction,
  createTemplateAction,
  setActiveTemplateAction,
} from "@/app/actions";
import { TitanEmptyPanel } from "@/app/_components/titan-empty-panel";
import { TitanSubmitButton } from "@/app/_components/titan-submit-button";
import type { ManagementSnapshot } from "@/lib/titan";

interface TitanManagementConsoleProps {
  management: ManagementSnapshot;
}

function ForgeHeader({
  kicker,
  title,
  caption,
}: {
  kicker: string;
  title: string;
  caption: string;
}): React.JSX.Element {
  return (
    <div className="mb-5 flex items-end justify-between gap-3">
      <div>
        <p className="section-kicker">{kicker}</p>
        <h2 className="mt-2 text-2xl font-semibold text-[#fff7de]">{title}</h2>
      </div>
      <p className="max-w-[14rem] text-right text-xs uppercase tracking-[0.18em] text-[var(--titan-muted)]">
        {caption}
      </p>
    </div>
  );
}

function FormFrame({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <div className="panel rounded-[28px] p-4">
      <p className="section-kicker">{subtitle}</p>
      <h3 className="mt-2 text-lg font-semibold text-[#fff7de]">{title}</h3>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-[var(--titan-muted)]"
    >
      {children}
    </label>
  );
}

export function TitanManagementConsole({
  management,
}: TitanManagementConsoleProps): React.JSX.Element {
  const counterQuests = management.quests.filter(
    (quest) => quest.progressKind === "counter",
  );
  const hasTemplates = management.templates.length > 0;
  const hasQuests = management.quests.length > 0;
  const hasRewards = management.rewards.length > 0;
  const canCreateQuest = hasTemplates;
  const canCreateProgressOption = counterQuests.length > 0;
  const canAttachReward = hasQuests && hasRewards;

  return (
    <div className="panel overflow-visible rounded-[34px] p-5">
      <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-[#ee4266] to-transparent" />

      <ForgeHeader
        kicker="Quest forge"
        title="Management deck"
        caption="Phase 3 is live: templates, quests, rewards, and links now ship through real forms."
      />

      <div className="grid gap-4 xl:grid-cols-2">
        <FormFrame
          title="Template forge"
          subtitle="Shape the run"
        >
          <form action={createTemplateAction} className="space-y-4">
            <div>
              <FieldLabel htmlFor="template-title">Template title</FieldLabel>
              <input
                id="template-title"
                name="title"
                required
                maxLength={120}
                className="titan-input"
                placeholder="Balanced Hero"
                type="text"
              />
            </div>

            <div>
              <FieldLabel htmlFor="template-summary">Template summary</FieldLabel>
              <textarea
                id="template-summary"
                name="summary"
                required
                maxLength={2048}
                className="titan-textarea"
                placeholder="Blend study, movement, and reset habits into one daily run."
                rows={4}
              />
            </div>

            <div>
              <FieldLabel htmlFor="template-success-target">Daily clear rule</FieldLabel>
              <input
                id="template-success-target"
                name="success_target"
                required
                min={1}
                max={100}
                step={1}
                className="titan-input"
                defaultValue={3}
                type="number"
              />
            </div>

            <TitanSubmitButton
              idleLabel="Create template"
              pendingLabel="Forging template..."
              className="neo-button w-full rounded-full px-4 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#fff7de]"
            />
          </form>
        </FormFrame>

        <FormFrame
          title="Reward forge"
          subtitle="Stock the loot room"
        >
          <form action={createRewardAction} className="space-y-4">
            <div>
              <FieldLabel htmlFor="reward-title">Reward title</FieldLabel>
              <input
                id="reward-title"
                name="title"
                required
                maxLength={120}
                className="titan-input"
                placeholder="Arcade Pass"
                type="text"
              />
            </div>

            <div>
              <FieldLabel htmlFor="reward-description">Reward description</FieldLabel>
              <textarea
                id="reward-description"
                name="description"
                required
                maxLength={2048}
                className="titan-textarea"
                placeholder="Unlocked after keeping the shield online for a full week."
                rows={4}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <FieldLabel htmlFor="reward-rarity">Rarity</FieldLabel>
                <select id="reward-rarity" name="rarity" defaultValue="rare" required className="titan-select">
                  <option value="common">Common</option>
                  <option value="rare">Rare</option>
                  <option value="legendary">Legendary</option>
                </select>
              </div>

              <div>
                <FieldLabel htmlFor="reward-xp-cost">XP cost</FieldLabel>
                <input
                  id="reward-xp-cost"
                  name="xp_cost"
                  required
                  min={0}
                  max={1000000}
                  step={1}
                  className="titan-input"
                  defaultValue={120}
                  type="number"
                />
              </div>
            </div>

            <label className="titan-check-row">
              <input type="checkbox" name="unlocked" className="titan-checkbox" />
              <span>Spawn unlocked in the shop</span>
            </label>

            <TitanSubmitButton
              idleLabel="Create reward"
              pendingLabel="Forging reward..."
              className="neo-button w-full rounded-full px-4 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#fff7de]"
            />
          </form>
        </FormFrame>

        <FormFrame
          title="Quest forge"
          subtitle="Build the loop"
        >
          {canCreateQuest ? (
            <form action={createQuestAction} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <FieldLabel htmlFor="quest-template">Template</FieldLabel>
                  <select
                    id="quest-template"
                    name="template_id"
                    defaultValue={management.activeTemplateId}
                    required
                    className="titan-select"
                  >
                    {management.templates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <FieldLabel htmlFor="quest-type">Quest type</FieldLabel>
                  <select id="quest-type" name="type" defaultValue="daily" required className="titan-select">
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="epic">Epic</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <FieldLabel htmlFor="quest-progress-kind">Progress mode</FieldLabel>
                  <select
                    id="quest-progress-kind"
                    name="progress_kind"
                    defaultValue="boolean"
                    required
                    className="titan-select"
                  >
                    <option value="boolean">Boolean</option>
                    <option value="counter">Counter</option>
                  </select>
                </div>

                <div>
                  <FieldLabel htmlFor="quest-xp-value">XP value</FieldLabel>
                  <input
                    id="quest-xp-value"
                    name="xp_value"
                    required
                    min={0}
                    max={1000000}
                    step={1}
                    className="titan-input"
                    defaultValue={20}
                    type="number"
                  />
                </div>
              </div>

              <div>
                <FieldLabel htmlFor="quest-title">Quest title</FieldLabel>
                <input
                  id="quest-title"
                  name="title"
                  required
                  maxLength={120}
                  className="titan-input"
                  placeholder="Focus Sprint"
                  type="text"
                />
              </div>

              <div>
                <FieldLabel htmlFor="quest-summary">Quest summary</FieldLabel>
                <textarea
                  id="quest-summary"
                  name="summary"
                  required
                  maxLength={2048}
                  className="titan-textarea"
                  placeholder="Stack short sessions until the deck clears."
                  rows={4}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <FieldLabel htmlFor="quest-target-value">Target value</FieldLabel>
                  <input
                    id="quest-target-value"
                    name="target_value"
                    min={0}
                    max={1000000}
                    step={1}
                    className="titan-input"
                    placeholder="50"
                    type="number"
                  />
                </div>

                <div>
                  <FieldLabel htmlFor="quest-unit">Unit</FieldLabel>
                  <input
                    id="quest-unit"
                    name="unit"
                    maxLength={32}
                    className="titan-input"
                    placeholder="min / reps / pages"
                    type="text"
                  />
                </div>
              </div>

              <div>
                <FieldLabel htmlFor="quest-reward">Attach reward on spawn</FieldLabel>
                <select id="quest-reward" name="reward_id" defaultValue="" className="titan-select">
                  <option value="">No reward yet</option>
                  {management.rewards.map((reward) => (
                    <option key={reward.id} value={reward.id}>
                      {reward.title}
                    </option>
                  ))}
                </select>
              </div>

              <label className="titan-check-row">
                <input type="checkbox" name="is_core" className="titan-checkbox" />
                <span>Count as a core quest for the daily clear rule</span>
              </label>

              <TitanSubmitButton
                idleLabel="Create quest"
                pendingLabel="Forging quest..."
                className="neo-button w-full rounded-full px-4 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#fff7de]"
              />
            </form>
          ) : (
            <TitanEmptyPanel
              kicker="Quest forge"
              title="Create a Template first"
              description="Quests need a template anchor before they can enter the run. Forge the first template in the left deck, then come back here."
              hint="Template forge stays live even when the rest of the deck is empty."
            />
          )}
        </FormFrame>

        <FormFrame
          title="Link dock"
          subtitle="Tune progression"
        >
          <div className="space-y-5">
            {canCreateProgressOption ? (
              <form action={createQuestProgressOptionAction} className="space-y-4">
                <div>
                  <FieldLabel htmlFor="option-quest">Counter quest</FieldLabel>
                  <select id="option-quest" name="quest_id" required className="titan-select">
                    {counterQuests.map((quest) => (
                      <option key={quest.id} value={quest.id}>
                        {quest.templateTitle} - {quest.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
                  <div>
                    <FieldLabel htmlFor="option-label">Quick-add label</FieldLabel>
                    <input
                      id="option-label"
                      name="label"
                      required
                      maxLength={80}
                      className="titan-input"
                      placeholder="Pomodoro"
                      type="text"
                    />
                  </div>

                  <div>
                    <FieldLabel htmlFor="option-value">Value</FieldLabel>
                    <input
                      id="option-value"
                      name="value"
                      required
                      min={1}
                      max={10000}
                      step={1}
                      className="titan-input"
                      defaultValue={25}
                      type="number"
                    />
                  </div>
                </div>

                <TitanSubmitButton
                  idleLabel="Add quick progress option"
                  pendingLabel="Forging burst..."
                  className="neo-button w-full rounded-full px-4 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#fff7de]"
                />
              </form>
            ) : (
              <TitanEmptyPanel
                kicker="Link dock"
                title="No counter quests to wire"
                description="Quick-add bursts only work for counter quests. Forge at least one counter quest with a target value, then add its preset buttons here."
                hint="Protein Log is a strong candidate for burst presets."
              />
            )}

            <div className="h-px bg-white/8" />

            {canAttachReward ? (
              <form action={attachRewardToQuestAction} className="space-y-4">
                <div>
                  <FieldLabel htmlFor="attach-quest">Quest</FieldLabel>
                  <select id="attach-quest" name="quest_id" required className="titan-select">
                    {management.quests.map((quest) => (
                      <option key={quest.id} value={quest.id}>
                        {quest.templateTitle} - {quest.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <FieldLabel htmlFor="attach-reward">Reward</FieldLabel>
                  <select id="attach-reward" name="reward_id" required className="titan-select">
                    {management.rewards.map((reward) => (
                      <option key={reward.id} value={reward.id}>
                        {reward.title}
                      </option>
                    ))}
                  </select>
                </div>

                <TitanSubmitButton
                  idleLabel="Attach reward to quest"
                  pendingLabel="Linking reward..."
                  className="neo-button w-full rounded-full px-4 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#fff7de]"
                />
              </form>
            ) : (
              <TitanEmptyPanel
                kicker="Link dock"
                title="Need both quests and rewards"
                description="Reward links only become available once the deck has at least one quest and one reward. Forge both sides, then connect them here."
              />
            )}
          </div>
        </FormFrame>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2 xl:grid-cols-[1.05fr_1.2fr_0.95fr]">
        <div className="panel rounded-[28px] p-4">
          <ForgeHeader
            kicker="Templates"
            title="Live roster"
            caption="Activate a template to swap the dashboard context instantly."
          />
          {hasTemplates ? (
            <div className="grid gap-3">
              {management.templates.map((template) => (
                <article key={template.id} className="rounded-[24px] border border-white/10 bg-black/18 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-semibold text-[#fff7de]">{template.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-[var(--titan-muted)]">
                        {template.summary}
                      </p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${template.isActive ? "border border-emerald-300/20 bg-emerald-300/10 text-[#b4ffd8]" : "border border-white/10 bg-white/6 text-[var(--titan-muted)]"}`}>
                      {template.isActive ? "Active" : "Idle"}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.18em] text-[var(--titan-muted)]">
                    <span className="rounded-full border border-white/10 px-3 py-1">
                      {template.questCount} quests
                    </span>
                    <span className="rounded-full border border-white/10 px-3 py-1">
                      {template.coreQuestCount} core
                    </span>
                    <span className="rounded-full border border-white/10 px-3 py-1">
                      Rule {template.successTarget}
                    </span>
                  </div>

                  <p className="mt-4 text-xs uppercase tracking-[0.18em] text-[var(--titan-muted)]">
                    {template.successRuleLabel}
                  </p>

                  {!template.isActive ? (
                    <form action={setActiveTemplateAction} className="mt-4">
                      <input type="hidden" name="template_id" value={template.id} />
                      <TitanSubmitButton
                        idleLabel="Activate template"
                        pendingLabel="Switching template..."
                        className="neo-button w-full rounded-full px-4 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#fff7de]"
                      />
                    </form>
                  ) : null}
                </article>
              ))}
            </div>
          ) : (
            <TitanEmptyPanel
              kicker="Templates"
              title="Roster is empty"
              description="No templates have been forged yet, so the dashboard has no active run to render."
              hint="Start in Template forge above."
            />
          )}
        </div>

        <div className="panel rounded-[28px] p-4">
          <ForgeHeader
            kicker="Quests"
            title="Build queue"
            caption="Everything created in the forge lands here with its live wiring."
          />
          {hasQuests ? (
            <div className="grid gap-3">
              {management.quests.map((quest) => (
                <article key={quest.id} className="rounded-[24px] border border-white/10 bg-black/18 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="section-kicker">{quest.templateTitle}</p>
                      <h3 className="mt-2 text-base font-semibold text-[#fff7de]">{quest.title}</h3>
                    </div>
                    <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--titan-text)]">
                      {quest.type}
                    </span>
                  </div>

                  <p className="mt-3 text-sm leading-6 text-[var(--titan-muted)]">
                    {quest.summary}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.18em] text-[var(--titan-muted)]">
                    <span className="rounded-full border border-white/10 px-3 py-1">
                      {quest.progressKind}
                    </span>
                    <span className="rounded-full border border-white/10 px-3 py-1">
                      {quest.isCore ? "core" : "side"}
                    </span>
                    <span className="rounded-full border border-white/10 px-3 py-1">
                      +{quest.xpValue} xp
                    </span>
                    {quest.targetValue !== null ? (
                      <span className="rounded-full border border-white/10 px-3 py-1">
                        {quest.targetValue}
                        {quest.unit ? ` ${quest.unit}` : ""}
                      </span>
                    ) : null}
                    {quest.progressKind === "counter" ? (
                      <span className="rounded-full border border-white/10 px-3 py-1">
                        {quest.progressOptionCount} options
                      </span>
                    ) : null}
                  </div>

                  <p className="mt-4 text-xs uppercase tracking-[0.18em] text-[var(--titan-muted)]">
                    {quest.rewardTitle ? `Reward linked // ${quest.rewardTitle}` : "Reward pending"}
                  </p>
                </article>
              ))}
            </div>
          ) : (
            <TitanEmptyPanel
              kicker="Quests"
              title="Build queue is empty"
              description="No quests have been forged yet, so the player loop still has no content."
              hint="Create at least one Daily Quest to wake the run."
            />
          )}
        </div>

        <div className="panel rounded-[28px] p-4">
          <ForgeHeader
            kicker="Rewards"
            title="Loot ledger"
            caption="Track rarity, unlock state, and how many quests are wired to each item."
          />
          {hasRewards ? (
            <div className="grid gap-3">
              {management.rewards.map((reward) => (
                <article key={reward.id} className="rounded-[24px] border border-white/10 bg-black/18 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-semibold text-[#fff7de]">{reward.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-[var(--titan-muted)]">
                        {reward.description}
                      </p>
                    </div>
                    <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--titan-text)]">
                      {reward.rarity}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.18em] text-[var(--titan-muted)]">
                    <span className="rounded-full border border-white/10 px-3 py-1">
                      {reward.xpCost} xp
                    </span>
                    <span className="rounded-full border border-white/10 px-3 py-1">
                      {reward.linkedQuestCount} links
                    </span>
                    <span className="rounded-full border border-white/10 px-3 py-1">
                      {reward.unlocked ? "unlocked" : "locked"}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <TitanEmptyPanel
              kicker="Rewards"
              title="Loot ledger is empty"
              description="No rewards have been created yet, so the Shop and reward links still have nothing to surface."
              hint="Reward forge above is already ready."
            />
          )}
        </div>
      </div>
    </div>
  );
}
