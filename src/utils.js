
export function toTreeData(players) {

  const getRecruitedBy = (id) => players
    .filter((player) => player.recruitedBy === id)
    .map((player) => ({
      ...player,
      children: getRecruitedBy(player.id)
    }));

  return {
    name: 'Wolley CF',
    currentTeam: true,
    isRoot: true,
    children: getRecruitedBy(null)
  }

}
