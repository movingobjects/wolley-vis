
import * as d3 from 'd3';
import data from './data/data.json';

import Vis from './Vis';

export default class PlayerTree extends Vis {

  constructor() {

    super();

    this.players = data.players;
    this.seasons = data.seasons;

    this.seasons.sort((a, b) => a.year - b.year);

    this.processPlayersData();
    this.reset();

  }

  reset() {

    d3.select('#tree').selectAll('svg').remove();

    this.players.sort((a, b) => {

      switch (this.sortBy) {
        case 'sort-count': return (b.seasonCount - a.seasonCount) || (a.firstSeason - b.firstSeason) || ('' + a.name).localeCompare(b.name);
        case 'sort-start': return (a.firstSeason - b.firstSeason) || (b.seasonCount - a.seasonCount) || ('' + a.name).localeCompare(b.name);
        case 'sort-recruits': return (b.childCount - a.childCount) || ('' + a.name).localeCompare(b.name);
        case 'sort-recruits-current': return (b.childCountCurrent - a.childCountCurrent) || ('' + a.name).localeCompare(b.name);
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

    const treeData = this.toTreeData(this.players);

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
        .classed('highlighted', (d) => this.isHighlighted(d.data))
        .classed('has-children', (d) => d.data.children && d.data.children.length)
        .classed('sex-f', (d) => d.data.sex === 'f')
        .classed('sex-m', (d) => d.data.sex === 'm')
        .attr('transform', (d) => `translate(${d.y}, ${d.x})`);

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

    if (!this.highlightCurrentTeam) return true;

    return this.isCurrentTeam(player);

  }
  isCurrentTeam(player) {

    const currentSeason = this.seasons[this.seasons.length - 1];

    return currentSeason.players.includes(player.id);

  }

  processPlayersData() {

    const applyChildCounts = (player) => {

      if (player.id) {

        const p = this.players.find((p) => p.id === player.id);

        if (p) {
          p.childCount        = this.countChildren(player, false);
          p.childCountCurrent = this.countChildren(player, true) + (this.isCurrentTeam(p) ? 1 : 0);
        }

      }

      if (player.children) {
        player.children.forEach((p) => applyChildCounts(p));
      }

    }

    applyChildCounts(this.toTreeData(this.players));

    this.players.forEach((player) => {

      let count = 0;

      this.seasons.forEach((season) => {
        if (season.players.includes(player.id)) {
          count++;

          if (!player.firstSeason) {
            player.firstSeason = season.id;
          }

        }
      })

      player.seasonCount = count;

    });

  }
  toTreeData(players) {

    const getRecruitedBy = (id) => players
      .filter((player) => player.recruitedBy === id)
      .map((player) => ({
        ...player,
        children: getRecruitedBy(player.id)
      }));

    return {
      name: 'Wolley CF',
      currentTeam: true,
      children: getRecruitedBy(null)
    }

  }

  countChildren(player, currentTeam = false) {

    let count = 0;

    player.children.forEach((child) => {
      if (currentTeam) {
        if (this.isCurrentTeam(child)) count++;
      } else {
        count++;
      }
      count += this.countChildren(child, currentTeam);
    })

    return count;

  }

}
