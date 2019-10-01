
import * as d3 from 'd3';
import data from './data/data.json';

const TREE_W = 1875,
      TREE_H = 1190;

const TREE_MARGIN = {
  top: 0,
  right: 150,
  bottom: 0,
  left: 100
};

export default class SeasonTimeline {

  constructor() {

    this.sortBy               = 'sort-name';
    this.highlightCurrentTeam = true;

    this.players = data.players;
    this.seasons = data.seasons;

    this.seasons.sort((a, b) => a.year - b.year);

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

    })

    this.reset();
  }

  reset() {

    console.log(this.highlightCurrentTeam);

    d3.select('#timeline').selectAll('svg').remove();

    this.players.sort((a, b) => {

      switch (this.sortBy) {
        case 'sort-count': return b.seasonCount - a.seasonCount;
        case 'sort-start': return a.firstSeason - b.firstSeason;
        default: return ('' + a.name).localeCompare(b.name);
      }

    });

    this.generateTimeline();

  }

  generateTimeline() {

    const svg = d3.select('#timeline').append('svg')
      .attr('width', TREE_W)
      .attr('height', TREE_H);

    const g = svg.append('g')
      .attr('transform', `translate(${TREE_MARGIN.left}px, ${TREE_MARGIN.top}px)`);

    const seasonBgs    = g.append('g').classed('season-bgs', true),
          seasonLabels = g.append('g').classed('season-labels', true),
          yearLabels   = g.append('g').classed('year-labels', true);

    this.seasons.forEach((season, i) => {

      let x = 237 + (i * 75);

      yearLabels.append('text')
        .attrs({
          'text-anchor': 'middle',
          'dx': x,
          'dy': 33
        })
        .text(season.year);

      seasonLabels.append('text')
        .attrs({
          'text-anchor': 'middle',
          'dx': x,
          'dy': 20
        })
        .text(season.season);

      if (season.year % 2) {
        seasonBgs.append('rect')
          .styles({
            'fill': '#f6f9f9'
          })
          .attrs({
            'rx': 5,
            'x': 200 + (i * 75),
            'y': 0,
            'width': 75,
            'height': TREE_H
          })
      }

    });

    this.players.forEach((player, i) => {

      let row = g.append('g')
        .classed('row', true)
        .classed('current-team', this.isCurrentTeam(player))
        .classed('sex-f', player.sex === 'f')
        .classed('sex-m', player.sex === 'm')
        .styles({
          'transform': `translate(0px, ${60 + (i * 20)}px)`
        });

      row.append('text')
        .attrs({
          'alignment-baseline': 'hanging',
          'text-anchor': 'end',
          'x': 175
        })
        .text(player.name);

      this.seasons.forEach((season, j) => {

        const inSeason   = season.players.includes(player.id),
              nextSeason = this.seasons[j + 1],
              inNextSeason = nextSeason && nextSeason.players.includes(player.id);

        if (inSeason) {
          row.append('rect')
            .attrs({
              'x': 205 + (j * 75),
              'y': 0,
              'width': inNextSeason ? 90 : 65,
              'height': 10,
              'rx': 5
            });
        }

      });


    });

    let checkboxCurrentTeam = d3.select('#checkbox-highlight-current-team'),
        selectSort          = d3.select('#select-sort');

    checkboxCurrentTeam.on('change', () => {
      this.highlightCurrentTeam = checkboxCurrentTeam.property('checked');
      this.reset();
    })
    selectSort.on('change', () => {
      this.sortBy = selectSort.node().value;
      this.reset();
    })

  }

  isCurrentTeam(player) {

    if (!this.highlightCurrentTeam) return true;

    const currentSeason = this.seasons[this.seasons.length - 1];

    return currentSeason.players.includes(player.id);

  }

}
