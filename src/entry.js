
import 'd3-selection-multi';
import * as d3 from 'd3';

import style from './styles/style.scss';

import PlayerTree from './PlayerTree.js';
import SeasonTimeline from './SeasonTimeline.js';

const visTree     = new PlayerTree();
const visTimeline = new SeasonTimeline();

const sortOptions = {
  timeline: [
    { value: 'sort-name', label: 'Name' },
    { value: 'sort-count', label: '# of Seasons' },
    { value: 'sort-start', label: 'First Season' }
  ],
  tree: [
    { value: 'sort-name', label: 'Name' },
    { value: 'sort-recruits', label: '# of Recruits' },
    { value: 'sort-recruits-current', label: '# of Recruits (Current Team)' },
    { value: 'sort-count', label: '# of Seasons' },
    { value: 'sort-start', label: 'First Season' }
  ]
}

let sortBy               = 'sort-name',
    highlightCurrentTeam = false;

const selectVis         = d3.select('#select-vis'),
      selectSort        = d3.select('#select-sort'),
      checkboxHighlight = d3.select('#checkbox-highlight');


init();

function init() {

  selectVis.on('change', () => updateVis());
  selectSort.on('change', () => updateSort());
  checkboxHighlight.on('change', () => updateHighlight());

  updateVis();
  updateSort();
  updateHighlight();

}

function updateVis() {

  const visId     = selectVis.node().value,
        classList = document.body.classList;

  classList.toggle('show-tree', visId === 'tree');
  classList.toggle('show-timeline', visId === 'timeline');

  updateSortSelects(visId);

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

  const data = sortOptions[visId];

  selectSort.html('');

  data.forEach((opt) => {

    selectSort.append('option')
      .attr('value', opt.value)
      .text(opt.label);

  });

}
