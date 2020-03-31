
import 'd3-selection-multi';
import * as d3 from 'd3';

import style from './styles/style.scss';

import PlayerTree from './PlayerTree.js';
import SeasonTimeline from './SeasonTimeline.js';

import { toTreeData } from './utils.js';

import srcData from './data/data.json';

const sortOptions = {
  timeline: [
    { value: 'sort-name', label: 'Name' },
    { value: 'sort-start', label: 'First Season' },
    { value: 'sort-count', label: '# of Seasons' },
    { value: 'sort-recruits', label: '# of Recruits' },
    { value: 'sort-recruit-progeny', label: '# of Recruit Progeny' },
    { value: 'sort-recruit-progeny-current', label: '# of Recruit Progeny (Current Team)' }
  ],
  tree: [
    { value: 'sort-name', label: 'Name' },
    { value: 'sort-recruits', label: '# of Recruits' },
    { value: 'sort-recruit-progeny', label: '# of Recruit Progeny' },
    { value: 'sort-recruit-progeny-current', label: '# of Recruit Progeny (Current Team)' }
  ]
}

let visTree,
    visTimeline;

let sortBy               = 'sort-name',
    highlightCurrentTeam = false;

const selectVis         = d3.select('#select-vis'),
      selectSort        = d3.select('#select-sort'),
      checkboxHighlight = d3.select('#checkbox-highlight');


init();

function init() {

  const data  = processData(srcData);

  visTree     = new PlayerTree(data);
  visTimeline = new SeasonTimeline(data);

  selectVis.on('change', () => updateVis());
  selectSort.on('change', () => updateSort());
  checkboxHighlight.on('change', () => updateHighlight());

  updateVis();
  updateSort();
  updateHighlight();

}

function processData(data) {

  const isCurrentTeam = (player) => {

    const currentSeason = data.seasons[data.seasons.length - 1];

    return currentSeason.players.includes(player.id);

  }

  const countRecruits = (player, progeny = false, currentTeam = false) => {

    let count = 0;

    player.children.forEach((child) => {
      if (!currentTeam || child.currentTeam) count++;
      if (progeny) {
        count += countRecruits(child, progeny, currentTeam);
      }
    })

    return count;

  }

  const applyRecruitCounts = (player) => {

    if (player.id) {

      const p = data.players.find((p) => p.id === player.id);

      if (p) {
        p.recruitCount          = countRecruits(player, false, false);
        p.recruitProgeny        = countRecruits(player, true, false);
        p.recruitProgenyCurrent = countRecruits(player, true, true);
      }

    }

    if (player.children) {
      player.children.forEach((p) => applyRecruitCounts(p));
    }

  }

  data.players.forEach((player) => {

    let seasonCount = 0;

    data.seasons.forEach((season) => {
      if (season.players.includes(player.id)) {
        seasonCount++;

        if (!player.firstSeason) {
          player.firstSeason = season.id;
        }

      }
    })

    player.currentTeam = isCurrentTeam(player);
    player.seasonCount   = seasonCount;

  });

  applyRecruitCounts(toTreeData(data.players));

  return data;

}

function updateVis() {

  const visId     = selectVis.node().value,
        classList = document.body.classList;

  classList.toggle('show-tree', visId === 'tree');
  classList.toggle('show-timeline', visId === 'timeline');

  updateSortSelects(visId);
  updateSort();

}
function updateSort() {

  const sortKind = selectSort.node().value;

  visTimeline.setSortBy(sortKind);
  visTree.setSortBy(sortKind);

}
function updateHighlight() {

  const highlight = checkboxHighlight.property('checked');

  visTimeline.setHighlightCurrentTeam(highlight);
  visTree.setHighlightCurrentTeam(highlight);

}

function updateSortSelects(visId) {

  const data     = sortOptions[visId],
        sortKind = selectSort.node().value;

  selectSort.html('');

  data.forEach((opt) => {
    selectSort.append('option')
      .attr('value', opt.value)
      .text(opt.label);
  });

  if (data.find((opt) => opt.value === sortKind)) {
    selectSort.property('value', sortKind);
  }

}
