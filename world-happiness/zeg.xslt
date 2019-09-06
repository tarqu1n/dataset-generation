<xsl:transform xmlns="http://www.w3.org/2000/svg" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">

<xsl:variable name="happiness" select="/row/value[@colname='happiness']"/>
<xsl:variable name="image_path" select="/row/value[@colname='image']"/>
<xsl:variable name="happiness_change" select="/row/value[@colname='change_in_happiness']"/>

<xsl:variable name="line_width" select="150"/>
<xsl:variable name="line_width_from_gdp" select="$line_width div 10 * (/row/value[@colname='happiness_explained_by_gdp_per_capita'])" />
<xsl:variable name="line_start_from_gdp" select="5" />
<xsl:variable name="line_width_from_social_support" select="$line_width div 10 * (/row/value[@colname='happiness_explained_by_social_support'])" />
<xsl:variable name="line_start_from_social_support" select="$line_start_from_gdp + $line_width_from_gdp" />
<xsl:variable name="line_width_from_life_expectancy" select="$line_width div 10 * (/row/value[@colname='happiness_explained_by_life_expectancy'])" />
<xsl:variable name="line_start_from_life_expectancy" select="$line_start_from_social_support + $line_width_from_social_support" />
<xsl:variable name="line_width_from_freedom" select="$line_width div 10 * (/row/value[@colname='happiness_explained_by_freedom'])" />
<xsl:variable name="line_start_from_freedom" select="$line_start_from_life_expectancy + $line_width_from_life_expectancy" />
<xsl:variable name="line_width_from_generocity" select="$line_width div 10 * (/row/value[@colname='happiness_explained_by_generocity'])" />
<xsl:variable name="line_start_from_generocity" select="$line_start_from_freedom + $line_width_from_freedom" />
<xsl:variable name="line_width_from_corruption" select="$line_width div 10 * (/row/value[@colname='happiness_explained_by_corruption'])" />
<xsl:variable name="line_start_from_corruption" select="$line_start_from_generocity + $line_width_from_generocity" />


<xsl:template match="row">
	<svg width="160" height="90" xmlns:xlink="http://www.w3.org/1999/xlink" >
		<rect x="0" y="0" width="100%" height="100%" fill='#fff'>
			<xsl:apply-templates select="/row/value[@colname='happiness']"/>
		</rect>
		<text x="2" y="10" font-size="8" font-family="Helvetica" fill="#fff">
			<xsl:value-of select="/row/value[@colname='name']"/>
		</text>
		<text x="2" y="20" font-size="8" font-family="Helvetica" fill="#fff">
			Happiness: <xsl:value-of select="round($happiness * 100) div 100"/>
		</text>
		<image x="95" y="5" id="flag" xlink:href="https://edge.zegami.com/zegs/world_happiness/{$image_path}" preserveAspectRatio="meet" width="60" height="40" />

		<line class="contributionLine" x1="{$line_start_from_gdp}" x2="{$line_start_from_gdp + $line_width_from_gdp}" y1="75" y2="75" style="stroke:rgb(148,54,142); stroke-width:10" />
		<line class="contributionLine" x1="{$line_start_from_social_support}" x2="{$line_start_from_social_support + $line_width_from_social_support}" y1="75" y2="75" style="stroke:rgb(235,0,139); stroke-width:10" />
		<line class="contributionLine" x1="{$line_start_from_life_expectancy}" x2="{$line_start_from_life_expectancy + $line_width_from_life_expectancy}" y1="75" y2="75" style="stroke:rgb(253,100,47); stroke-width:10" />
		<line class="contributionLine" x1="{$line_start_from_freedom}" x2="{$line_start_from_freedom + $line_width_from_freedom}" y1="75" y2="75" style="stroke:rgb(219,244,0); stroke-width:10" />
		<line class="contributionLine" x1="{$line_start_from_generocity}" x2="{$line_start_from_generocity + $line_width_from_generocity}" y1="75" y2="75" style="stroke:rgb(101,200,208); stroke-width:10" />
		<line class="contributionLine" x1="{$line_start_from_corruption}" x2="{$line_start_from_corruption + $line_width_from_corruption}" y1="75" y2="75" style="stroke:rgb(135,140,197); stroke-width:10" />
	</svg>
</xsl:template>

<xsl:template match="/row/value[@colname='happiness']">
	<xsl:variable name="n" select="round($happiness * 100) div 100"/>
	<xsl:attribute name="fill">
		<xsl:choose>
			<xsl:when test="$n &gt; 8">#00A650</xsl:when>
			<xsl:when test="$n &gt; 7">#18984B</xsl:when>
			<xsl:when test="$n &gt; 6">#497C43</xsl:when>
			<xsl:when test="$n &gt; 5">#776138</xsl:when>
			<xsl:when test="$n &gt; 4">#A84532</xsl:when>
			<xsl:when test="$n &gt; 3">#BE382D</xsl:when>
			<xsl:when test="$n &gt; 2">#BE382D</xsl:when>
			<xsl:when test="$n &gt; 1">#D82B27</xsl:when>
			<xsl:when test="$n &gt; 0">#EE1C25</xsl:when>
			<xsl:otherwise>#ccc</xsl:otherwise>
		</xsl:choose>
	</xsl:attribute>
</xsl:template>

<xsl:template match="/row/value[@colname='change_in_happiness']">
	<xsl:choose>
		<xsl:when test="$happiness_change &gt; 0">
			<polyline fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" points="
				0.375,0.375 45.63,38.087 0.375,75.8 "/>
		</xsl:when>
	</xsl:choose>
</xsl:template>

</xsl:transform>
