
import * as d3 from 'd3';
import data from './data/data.json';

const TREE_W = 1200,
      TREE_H = 750;

const TREE_MARGIN = {
  top: 0,
  right: 150,
  bottom: 0,
  left: 100
};

export default class PlayerTree {

  constructor() {

    this.players = data.players;

    this.seasons = data.seasons;
    this.seasons.sort((a, b) => {
      return a.year - b.year;
    });

    let treeData = this.toTreeData(this.players);

    this.generateTree(treeData);

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

  generateTree(treeData) {

    const tree = d3.tree()
      .size([
        TREE_H - TREE_MARGIN.top - TREE_MARGIN.bottom,
        TREE_W - TREE_MARGIN.left - TREE_MARGIN.right
      ]);

    let nodes = tree(d3.hierarchy(treeData, (d) => d.children));

    const svg = d3.select('#tree').append('svg')
      .attr('width', TREE_W)
      .attr('height', TREE_H);

    const g = svg.append('g')
      .attr('transform', `translate(${TREE_MARGIN.left}, ${TREE_MARGIN.top})`);

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
        .classed('current-team', (d) => this.isCurrentTeam(d.data))
        .classed('has-children', (d) => d.data.children && d.data.children.length)
        .classed('sex-f', (d) => d.data.sex === 'f')
        .classed('sex-m', (d) => d.data.sex === 'm')
        .attr('transform', (d) => `translate(${d.y}, ${d.x})`);

    node.append('circle')
      .attr('r', (d) => this.isCurrentTeam(d.data) ? 5 : 3);

    node.append('text')
      .attrs({
        'dx': (d, i) => (i === 0) ? '-5px' : '8px',
        'dy': '0.35em',
        'text-anchor': (d, i) => (i === 0) ? 'end' : 'start'
      })
      .text((d) => d.data.name);

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

  isCurrentTeam(player) {

    const currentSeason = this.seasons[this.seasons.length - 1];

    return currentSeason.players.includes(player.id);

  }

}
