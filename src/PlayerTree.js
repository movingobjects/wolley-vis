
import * as d3 from 'd3';

import Vis from './Vis';

import { toTreeData } from './utils.js';

export default class PlayerTree extends Vis {

  constructor(data) {

    super();

    this.players     = data.players;
    this.seasons     = data.seasons;

    this.seasons.sort((a, b) => a.year - b.year);

    this.reset();

  }

  reset() {

    d3.select('#tree').selectAll('svg').remove();

    this.players.sort((a, b) => {

      switch (this.sortBy) {
        case 'sort-count': return (b.seasonCount - a.seasonCount) || (a.firstSeason - b.firstSeason) || ('' + a.name).localeCompare(b.name);
        case 'sort-start': return (a.firstSeason - b.firstSeason) || (b.seasonCount - a.seasonCount) || ('' + a.name).localeCompare(b.name);
        case 'sort-recruits': return (b.recruitCount - a.recruitCount) || ('' + a.name).localeCompare(b.name);
        case 'sort-recruit-progeny': return (b.recruitProgeny - a.recruitProgeny) || ('' + a.name).localeCompare(b.name);
        case 'sort-recruit-progeny-current': return (b.recruitProgenyCurrent - a.recruitProgenyCurrent) || ('' + a.name).localeCompare(b.name);
        default: return (`${a.name}`).localeCompare(b.name);
      }

    });

    this.initVis();

  }

  initVis() {

    const SVG_W = 1600,
          SVG_H = 750;

    const SVG_MARGIN = {
      top: 0,
      right: 200,
      bottom: 0,
      left: 125
    };

    const treeData = toTreeData(this.players);

    const tree = d3.tree()
      .size([
        SVG_H - SVG_MARGIN.top - SVG_MARGIN.bottom,
        SVG_W - SVG_MARGIN.left - SVG_MARGIN.right
      ]);

    let nodes = tree(d3.hierarchy(treeData, (d) => d.children));

    const svg = d3.select('#tree div.wrap-vis').append('svg')
      .attr('width', SVG_W)
      .attr('height', SVG_H);

    const g = svg.append('g')
      .attr('transform', `translate(${SVG_MARGIN.left}, ${SVG_MARGIN.top})`);

    var link = g.selectAll('.link')
      .data(nodes.descendants().slice(1))
      .enter().append('path')
        .classed('link', 'true')
        .classed('sex-f', (d) => d.data.sex === 'f')
        .classed('sex-m', (d) => d.data.sex === 'm')
        .attr('d', (d) => `M ${d.y},${d.x}C${(d.y + d.parent.y) / 2},${d.x} ${(d.y + d.parent.y) / 2},${d.parent.x} ${d.parent.y},${d.parent.x}`);

    var node = g.selectAll('.node')
      .data(nodes.descendants())
      .enter().append('g')
        .classed('node', true)
        .classed('root', (d) => d.data.isRoot)
        .classed('highlighted', (d) => this.isHighlighted(d.data))
        .classed('has-children', (d) => d.data.children && d.data.children.length)
        .classed('sex-f', (d) => d.data.sex === 'f')
        .classed('sex-m', (d) => d.data.sex === 'm')
        .attr('transform', (d) => `translate(${d.y}, ${d.x})`)
        .on('mouseover', (d) => {
          this.showPlayerTooltip(d.data);
        })
        .on('mouseout', () => {
          this.hidePlayerTooltip();
        });

    node.append('circle')
      .attr('r', (d) => this.isHighlighted(d.data) ? 5 : 3);

    node.append('text')
      .attrs({
        'dx': (d, i) => (i === 0) ? '-5px' : '8px',
        'dy': '0.35em',
        'text-anchor': (d, i) => (i === 0) ? 'end' : 'start'
      })
      .text((d) => d.data.name);


  }

  isHighlighted(player) {
    return !this.highlightCurrentTeam || player.currentTeam;
  }

  showPlayerTooltip(player) {

    document.addEventListener('mousemove', this.onTooltipMouseMove);

    const tooltip = d3.select('#tooltip');

    tooltip
      .classed('on', true)
      .html('');

    if (player.image) {
      tooltip.append('img')
        .attr('src', player.image);
    }

    tooltip.append('h3')
      .text(player.name);

    const table = tooltip.append('table');

    const addRow = (textLeft, textRight) => {
      const tr = table.append('tr');

      if (textRight !== undefined) {
        tr.append('td').text(textLeft);
        tr.append('td').text(textRight);
      } else {
        tr.append('td')
          .text(textLeft)
          .attr('colspan', 2);
      }

    }

    const getPlayerName = (playerId) => {
      const player = this.players.find((p) => p.id === playerId);
      return player ? player.name : 'Unknown';
    }

    if (player.firstSeason === '2014.3') {
      addRow('‎★ OG member');
    }

    if (player.recruitedBy) {
      addRow('Recruited by', getPlayerName(player.recruitedBy));
    }

    addRow('Joined', player.firstSeason);
    addRow('Seasons', player.seasonCount);

    if (player.recruitCount) {
      addRow('Recruits', player.recruitCount);
    }
    if (player.recruitProgeny) {
      addRow('Recruit Progeny', `${player.recruitProgeny} (${player.recruitProgenyCurrent} current team)`);
    }

  }
  hidePlayerTooltip() {

    document.removeEventListener('mousemove', this.onTooltipMouseMove);

    d3.select('#tooltip')
      .classed('on', false);

  }

  onTooltipMouseMove = (e) => {

    const {
      pageX,
      pageY
    } = e;

    const isBelow = pageY < 400,
          yOffset = isBelow ? 0 : -15;

    d3.select('#tooltip')
      .classed('below', isBelow)
      .styles({
        left: `${pageX}px`,
        top: `${pageY + yOffset}px`
      });

  }

}
