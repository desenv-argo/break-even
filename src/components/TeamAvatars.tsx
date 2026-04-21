export function TeamAvatars() {
  return (
    <div className="team-avatars" aria-label="Time Argo">
      <div className="avatar-stack">
        <div className="avatar-wrap" title="Gabriel · CTO, Argo">
          <img src="/avatars/gabriel-cto.png" alt="Gabriel, CTO da Argo" width={40} height={40} loading="lazy" />
        </div>
        <div className="avatar-wrap" title="Thiago · CPO, Argo">
          <img src="/avatars/thiago-cpo.png" alt="Thiago, CPO da Argo" width={40} height={40} loading="lazy" />
        </div>
      </div>
      <div className="team-avatars-meta">
        <span className="team-avatars-names">Gabriel · Thiago</span>
        <span className="team-avatars-roles">CTO &amp; CPO · Argo</span>
      </div>
    </div>
  );
}
