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
import {
  formatProgressKindLabel,
  formatQuestTypeLabel,
  formatRewardRarityLabel,
  getMessages,
  type Locale,
} from "@/lib/i18n";
import type { ManagementSnapshot } from "@/lib/titan";

interface TitanManagementConsoleProps {
  locale: Locale;
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
  locale,
  management,
}: TitanManagementConsoleProps): React.JSX.Element {
  const messages = getMessages(locale);
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
        kicker={messages.management.kicker}
        title={messages.management.title}
        caption={messages.management.caption}
      />

      <div className="grid gap-4 xl:grid-cols-2">
        <FormFrame
          title={messages.management.templateForgeTitle}
          subtitle={messages.management.templateForgeSubtitle}
        >
          <form action={createTemplateAction} className="space-y-4">
            <div>
              <FieldLabel htmlFor="template-title">
                {messages.management.templateTitleLabel}
              </FieldLabel>
              <input
                id="template-title"
                name="title"
                required
                maxLength={120}
                className="titan-input"
                placeholder={messages.management.templateTitlePlaceholder}
                type="text"
              />
            </div>

            <div>
              <FieldLabel htmlFor="template-summary">
                {messages.management.templateSummaryLabel}
              </FieldLabel>
              <textarea
                id="template-summary"
                name="summary"
                required
                maxLength={2048}
                className="titan-textarea"
                placeholder={messages.management.templateSummaryPlaceholder}
                rows={4}
              />
            </div>

            <div>
              <FieldLabel htmlFor="template-success-target">
                {messages.management.dailyClearRuleLabel}
              </FieldLabel>
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
              idleLabel={messages.management.createTemplate}
              pendingLabel={messages.management.creatingTemplate}
              className="neo-button w-full rounded-full px-4 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#fff7de]"
            />
          </form>
        </FormFrame>

        <FormFrame
          title={messages.management.rewardForgeTitle}
          subtitle={messages.management.rewardForgeSubtitle}
        >
          <form action={createRewardAction} className="space-y-4">
            <div>
              <FieldLabel htmlFor="reward-title">
                {messages.management.rewardTitleLabel}
              </FieldLabel>
              <input
                id="reward-title"
                name="title"
                required
                maxLength={120}
                className="titan-input"
                placeholder={messages.management.rewardTitlePlaceholder}
                type="text"
              />
            </div>

            <div>
              <FieldLabel htmlFor="reward-description">
                {messages.management.rewardDescriptionLabel}
              </FieldLabel>
              <textarea
                id="reward-description"
                name="description"
                required
                maxLength={2048}
                className="titan-textarea"
                placeholder={messages.management.rewardDescriptionPlaceholder}
                rows={4}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <FieldLabel htmlFor="reward-rarity">
                  {messages.management.rarityLabel}
                </FieldLabel>
                <select id="reward-rarity" name="rarity" defaultValue="rare" required className="titan-select">
                  <option value="common">{formatRewardRarityLabel(locale, "common")}</option>
                  <option value="rare">{formatRewardRarityLabel(locale, "rare")}</option>
                  <option value="legendary">{formatRewardRarityLabel(locale, "legendary")}</option>
                </select>
              </div>

              <div>
                <FieldLabel htmlFor="reward-xp-cost">
                  {messages.management.xpCostLabel}
                </FieldLabel>
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
              <span>{messages.management.spawnUnlocked}</span>
            </label>

            <TitanSubmitButton
              idleLabel={messages.management.createReward}
              pendingLabel={messages.management.creatingReward}
              className="neo-button w-full rounded-full px-4 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#fff7de]"
            />
          </form>
        </FormFrame>

        <FormFrame
          title={messages.management.questForgeTitle}
          subtitle={messages.management.questForgeSubtitle}
        >
          {canCreateQuest ? (
            <form action={createQuestAction} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <FieldLabel htmlFor="quest-template">
                    {messages.management.templateLabel}
                  </FieldLabel>
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
                  <FieldLabel htmlFor="quest-type">
                    {messages.management.questTypeLabel}
                  </FieldLabel>
                  <select id="quest-type" name="type" defaultValue="daily" required className="titan-select">
                    <option value="daily">{formatQuestTypeLabel(locale, "daily")}</option>
                    <option value="weekly">{formatQuestTypeLabel(locale, "weekly")}</option>
                    <option value="monthly">{formatQuestTypeLabel(locale, "monthly")}</option>
                    <option value="epic">{formatQuestTypeLabel(locale, "epic")}</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <FieldLabel htmlFor="quest-progress-kind">
                    {messages.management.progressModeLabel}
                  </FieldLabel>
                  <select
                    id="quest-progress-kind"
                    name="progress_kind"
                    defaultValue="boolean"
                    required
                    className="titan-select"
                  >
                    <option value="boolean">{formatProgressKindLabel(locale, "boolean")}</option>
                    <option value="counter">{formatProgressKindLabel(locale, "counter")}</option>
                  </select>
                </div>

                <div>
                  <FieldLabel htmlFor="quest-xp-value">
                    {messages.management.xpValueLabel}
                  </FieldLabel>
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
                <FieldLabel htmlFor="quest-title">
                  {messages.management.questTitleLabel}
                </FieldLabel>
                <input
                  id="quest-title"
                  name="title"
                  required
                  maxLength={120}
                  className="titan-input"
                  placeholder={messages.management.questTitlePlaceholder}
                  type="text"
                />
              </div>

              <div>
                <FieldLabel htmlFor="quest-summary">
                  {messages.management.questSummaryLabel}
                </FieldLabel>
                <textarea
                  id="quest-summary"
                  name="summary"
                  required
                  maxLength={2048}
                  className="titan-textarea"
                  placeholder={messages.management.questSummaryPlaceholder}
                  rows={4}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <FieldLabel htmlFor="quest-target-value">
                    {messages.management.targetValueLabel}
                  </FieldLabel>
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
                  <FieldLabel htmlFor="quest-unit">
                    {messages.management.unitLabel}
                  </FieldLabel>
                  <input
                    id="quest-unit"
                    name="unit"
                    maxLength={32}
                    className="titan-input"
                    placeholder={messages.management.unitPlaceholder}
                    type="text"
                  />
                </div>
              </div>

              <div>
                <FieldLabel htmlFor="quest-reward">
                  {messages.management.attachRewardOnSpawnLabel}
                </FieldLabel>
                <select id="quest-reward" name="reward_id" defaultValue="" className="titan-select">
                  <option value="">{messages.management.noRewardYet}</option>
                  {management.rewards.map((reward) => (
                    <option key={reward.id} value={reward.id}>
                      {reward.title}
                    </option>
                  ))}
                </select>
              </div>

              <label className="titan-check-row">
                <input type="checkbox" name="is_core" className="titan-checkbox" />
                <span>{messages.management.countAsCore}</span>
              </label>

              <TitanSubmitButton
                idleLabel={messages.management.createQuest}
                pendingLabel={messages.management.creatingQuest}
                className="neo-button w-full rounded-full px-4 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#fff7de]"
              />
            </form>
          ) : (
            <TitanEmptyPanel
              kicker={messages.management.questForgeTitle}
              title={messages.management.createTemplateFirst}
              description={messages.management.createTemplateFirstDescription}
              hint={messages.management.createTemplateFirstHint}
            />
          )}
        </FormFrame>

        <FormFrame
          title={messages.management.linkDockTitle}
          subtitle={messages.management.linkDockSubtitle}
        >
          <div className="space-y-5">
            {canCreateProgressOption ? (
              <form action={createQuestProgressOptionAction} className="space-y-4">
                <div>
                  <FieldLabel htmlFor="option-quest">
                    {messages.management.counterQuestLabel}
                  </FieldLabel>
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
                    <FieldLabel htmlFor="option-label">
                      {messages.management.quickAddLabel}
                    </FieldLabel>
                    <input
                      id="option-label"
                      name="label"
                      required
                      maxLength={80}
                      className="titan-input"
                      placeholder={messages.management.quickAddPlaceholder}
                      type="text"
                    />
                  </div>

                  <div>
                    <FieldLabel htmlFor="option-value">
                      {messages.management.valueLabel}
                    </FieldLabel>
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
                  idleLabel={messages.management.addQuickProgressOption}
                  pendingLabel={messages.management.addingBurst}
                  className="neo-button w-full rounded-full px-4 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#fff7de]"
                />
              </form>
            ) : (
              <TitanEmptyPanel
                kicker={messages.management.linkDockTitle}
                title={messages.management.noCounterQuestsTitle}
                description={messages.management.noCounterQuestsDescription}
                hint={messages.management.noCounterQuestsHint}
              />
            )}

            <div className="h-px bg-white/8" />

            {canAttachReward ? (
              <form action={attachRewardToQuestAction} className="space-y-4">
                <div>
                  <FieldLabel htmlFor="attach-quest">
                    {messages.management.questLabel}
                  </FieldLabel>
                  <select id="attach-quest" name="quest_id" required className="titan-select">
                    {management.quests.map((quest) => (
                      <option key={quest.id} value={quest.id}>
                        {quest.templateTitle} - {quest.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <FieldLabel htmlFor="attach-reward">
                    {messages.management.rewardLabel}
                  </FieldLabel>
                  <select id="attach-reward" name="reward_id" required className="titan-select">
                    {management.rewards.map((reward) => (
                      <option key={reward.id} value={reward.id}>
                        {reward.title}
                      </option>
                    ))}
                  </select>
                </div>

                <TitanSubmitButton
                  idleLabel={messages.management.attachRewardToQuest}
                  pendingLabel={messages.management.attachingReward}
                  className="neo-button w-full rounded-full px-4 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#fff7de]"
                />
              </form>
            ) : (
              <TitanEmptyPanel
                kicker={messages.management.linkDockTitle}
                title={messages.management.needQuestsAndRewardsTitle}
                description={messages.management.needQuestsAndRewardsDescription}
              />
            )}
          </div>
        </FormFrame>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2 xl:grid-cols-[1.05fr_1.2fr_0.95fr]">
        <div className="panel rounded-[28px] p-4">
          <ForgeHeader
            kicker={messages.management.templatesKicker}
            title={messages.management.templatesTitle}
            caption={messages.management.templatesCaption}
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
                      {template.isActive ? messages.enums.active : messages.enums.idle}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.18em] text-[var(--titan-muted)]">
                    <span className="rounded-full border border-white/10 px-3 py-1">
                      {template.questCount} {messages.management.questsCountSuffix}
                    </span>
                    <span className="rounded-full border border-white/10 px-3 py-1">
                      {template.coreQuestCount} {messages.management.coreCountSuffix}
                    </span>
                    <span className="rounded-full border border-white/10 px-3 py-1">
                      {messages.management.rulePrefix} {template.successTarget}
                    </span>
                  </div>

                  <p className="mt-4 text-xs uppercase tracking-[0.18em] text-[var(--titan-muted)]">
                    {template.successRuleLabel}
                  </p>

                  {!template.isActive ? (
                    <form action={setActiveTemplateAction} className="mt-4">
                      <input type="hidden" name="template_id" value={template.id} />
                      <TitanSubmitButton
                        idleLabel={messages.management.activateTemplate}
                        pendingLabel={messages.management.activatingTemplate}
                        className="neo-button w-full rounded-full px-4 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#fff7de]"
                      />
                    </form>
                  ) : null}
                </article>
              ))}
            </div>
          ) : (
            <TitanEmptyPanel
              kicker={messages.management.templatesKicker}
              title={messages.management.rosterEmptyTitle}
              description={messages.management.rosterEmptyDescription}
              hint={messages.management.rosterEmptyHint}
            />
          )}
        </div>

        <div className="panel rounded-[28px] p-4">
          <ForgeHeader
            kicker={messages.management.questsKicker}
            title={messages.management.questsTitle}
            caption={messages.management.questsCaption}
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
                      {formatQuestTypeLabel(locale, quest.type)}
                    </span>
                  </div>

                  <p className="mt-3 text-sm leading-6 text-[var(--titan-muted)]">
                    {quest.summary}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.18em] text-[var(--titan-muted)]">
                    <span className="rounded-full border border-white/10 px-3 py-1">
                      {formatProgressKindLabel(locale, quest.progressKind)}
                    </span>
                    <span className="rounded-full border border-white/10 px-3 py-1">
                      {quest.isCore ? messages.enums.coreLabel : messages.enums.sideLabel}
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
                        {quest.progressOptionCount} {messages.management.optionsSuffix}
                      </span>
                    ) : null}
                  </div>

                  <p className="mt-4 text-xs uppercase tracking-[0.18em] text-[var(--titan-muted)]">
                    {quest.rewardTitle
                      ? `${messages.management.rewardLinkedPrefix} ${quest.rewardTitle}`
                      : messages.management.rewardPending}
                  </p>
                </article>
              ))}
            </div>
          ) : (
            <TitanEmptyPanel
              kicker={messages.management.questsKicker}
              title={messages.management.buildQueueEmptyTitle}
              description={messages.management.buildQueueEmptyDescription}
              hint={messages.management.buildQueueEmptyHint}
            />
          )}
        </div>

        <div className="panel rounded-[28px] p-4">
          <ForgeHeader
            kicker={messages.management.rewardsKicker}
            title={messages.management.rewardsTitle}
            caption={messages.management.rewardsCaption}
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
                      {formatRewardRarityLabel(locale, reward.rarity)}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.18em] text-[var(--titan-muted)]">
                    <span className="rounded-full border border-white/10 px-3 py-1">
                      {reward.xpCost} xp
                    </span>
                    <span className="rounded-full border border-white/10 px-3 py-1">
                      {reward.linkedQuestCount} {messages.enums.links}
                    </span>
                    <span className="rounded-full border border-white/10 px-3 py-1">
                      {reward.unlocked ? messages.enums.unlocked : messages.enums.locked}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <TitanEmptyPanel
              kicker={messages.management.rewardsKicker}
              title={messages.management.lootLedgerEmptyTitle}
              description={messages.management.lootLedgerEmptyDescription}
              hint={messages.management.lootLedgerEmptyHint}
            />
          )}
        </div>
      </div>
    </div>
  );
}
