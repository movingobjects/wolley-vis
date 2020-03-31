
import * as d3 from 'd3';
import data from './data/data.json';

import Vis from './Vis';

export default class SeasonTimeline extends Vis {

  constructor() {

    super();

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

    });

    this.reset();

  }

  reset() {

    d3.select('#timeline').selectAll('svg').remove();

    this.players.sort((a, b) => {

      switch (this.sortBy) {
        case 'sort-count': return (b.seasonCount - a.seasonCount) || (a.firstSeason - b.firstSeason) || ('' + a.name).localeCompare(b.name);
        case 'sort-start': return (a.firstSeason - b.firstSeason) || (b.seasonCount - a.seasonCount) || ('' + a.name).localeCompare(b.name);
        default: return (`${a.name}`).localeCompare(b.name);
      }

    });

    this.initVis();

  }

  initVis() {

    const totalH    = 70 + (this.players.length * 20),
          namesW    = 200,
          timelineW = this.seasons.length * 75;

    // Names

    const svgNames = d3.select('#timeline div.wrap-names').append('svg')
      .attr('width', namesW)
      .attr('height', totalH);

    this.players.forEach((player, i) => {

      let onCurrentTeam = this.isCurrentTeam(player);

      let row = svgNames.append('g')
        .classed('row', true)
        .classed('highlighted', onCurrentTeam)
        .classed('sex-f', player.sex === 'f')
        .classed('sex-m', player.sex === 'm')
        .styles({
          'transform': `translate(0px, ${60 + (i * 20)}px)`
        });

      row.append('text')
        .attrs({
          'alignment-baseline': 'hanging',
          'text-anchor': 'end',
          'x': 190
        })
        .text(player.name)
        .on('mouseover', () => {
          this.showPlayerTooltip(player);
          this.highlightRow(i);
        })
        .on('mouseout', () => {
          this.hidePlayerTooltip();
          this.unhighlightRow(i);
        });

    });

    // Seasons

    const svgTimeline = d3.select('#timeline div.wrap-timeline').append('svg')
      .attr('width', timelineW)
      .attr('height', totalH);

    const seasonBgs    = svgTimeline.append('g').classed('season-bgs', true),
          seasonLabels = svgTimeline.append('g').classed('season-labels', true),
          yearLabels   = svgTimeline.append('g').classed('year-labels', true);

    this.seasons.forEach((season, i) => {

      let x = 37 + (i * 75);

      yearLabels.append('text')
        .classed('alt', season.year % 2)
        .attrs({
          'text-anchor': 'middle',
          'dx': x,
          'dy': 33
        })
        .text(season.year);

      seasonLabels.append('text')
        .classed('alt', season.year % 2)
        .attrs({
          'text-anchor': 'middle',
          'dx': x,
          'dy': 20
        })
        .text(season.season);

      if (season.year % 2) {
        seasonBgs.append('rect')
          .attrs({
            'rx': 5,
            'x': i * 75,
            'y': 0,
            'width': 75,
            'height': totalH
          })
      }

    });

    this.players.forEach((player, i) => {

      let onCurrentTeam = this.isCurrentTeam(player);

      let row = svgTimeline.append('g')
        .classed('row', true)
        .classed('highlighted', onCurrentTeam)
        .classed('sex-f', player.sex === 'f')
        .classed('sex-m', player.sex === 'm')
        .styles({
          'transform': `translate(0px, ${60 + (i * 20)}px)`
        })
        .on('mouseover', () => {
          this.showPlayerTooltip(player);
          this.highlightRow(i);
        })
        .on('mouseout', () => {
          this.hidePlayerTooltip();
          this.unhighlightRow(i);
        });


      this.seasons.forEach((season, j) => {

        const inSeason   = season.players.includes(player.id),
              nextSeason = this.seasons[j + 1],
              inNextSeason = nextSeason && nextSeason.players.includes(player.id);

        if (inSeason) {
          row.append('rect')
            .attrs({
              'x': 5 + (j * 75),
              'y': 0,
              'width': inNextSeason ? 90 : 65,
              'height': 10,
              'rx': 5
            });
        }

      });


    });

  }

  isCurrentTeam(player) {

    if (!this.highlightCurrentTeam) return true;

    const currentSeason = this.seasons[this.seasons.length - 1];

    return currentSeason.players.includes(player.id);

  }

  highlightRow(index) {
    d3.select(`#timeline div.wrap-names g.row:nth-child(${index + 1})`).classed('selected', true);
    d3.select(`#timeline div.wrap-timeline g.row:nth-child(${index + 4})`).classed('selected', true);
  }
  unhighlightRow(index) {
    d3.select(`#timeline div.wrap-names g.row:nth-child(${index + 1})`).classed('selected', false);
    d3.select(`#timeline div.wrap-timeline g.row:nth-child(${index + 4})`).classed('selected', false);
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

      if (textRight) {
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
