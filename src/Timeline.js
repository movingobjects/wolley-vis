
import * as d3 from 'd3';
import playerData from './data/data.json';

export default class Timeline {

  constructor() {

    let treeData = this.toTreeData(playerData.players);

    this.generateTree(treeData)

  }

  toTreeData(players) {

    const getRecruitedBy = (id) => players
      .filter((player) => player.recruitedBy === id)
      .map((player) => ({
        name: player.name,
        currentTeam: player.currentTeam,
        children: getRecruitedBy(player.id)
      }));

    return {
      name: 'Wolley CF',
      currentTeam: true,
      children: getRecruitedBy(null)
    }

  }

  generateTree(treeData) {

    const WIDTH  = 1500,
          HEIGHT = 750;

    const MARGIN = {
      top: 0,
      right: 150,
      bottom: 0,
      left: 50
    };

    const tree = d3.tree()
      .size([
        HEIGHT - MARGIN.top - MARGIN.bottom,
        WIDTH - MARGIN.left - MARGIN.right
      ]);

    let nodes = tree(d3.hierarchy(treeData, (d) => d.children));

    const svg = d3.select('body').append('svg')
      .attr('width', WIDTH)
      .attr('height', HEIGHT);

    const g = svg.append('g')
      .attr('transform', `translate(${MARGIN.left}, ${MARGIN.top})`);

    var link = g.selectAll('.link')
      .data(nodes.descendants().slice(1))
      .enter().append('path')
        .attr('class', 'link')
        .attr('d', (d) => `M ${d.y},${d.x}C${(d.y + d.parent.y) / 2},${d.x} ${(d.y + d.parent.y) / 2},${d.parent.x} ${d.parent.y},${d.parent.x}`);

    var node = g.selectAll('.node')
      .data(nodes.descendants())
      .enter().append('g')
        .attr('class', (d) => 'node' + (d.children ? ' node--internal' : ' node--leaf'))
        .attr('transform', (d) => `translate(${d.y}, ${d.x})`);

    node.append('circle')
      .attr('r', 5);

    node.append('text')
      .attr('dy', '.35em')
      .attr('x', 10)
      .style('font-weight', (d) => d.data.currentTeam ? 'bold' : 'normal')
      .style('fill', (d) => d.data.currentTeam ? '#06c' : '#999')
      .text((d) => d.data.name);


  }

}
