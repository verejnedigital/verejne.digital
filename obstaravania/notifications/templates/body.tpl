<style>
	* {
		font-family: freesans;
		font-size: 12pt;
		color: black;
	}
	.welcome {
		text-align: justify;
		page-break-inside: avoid;
	}
	.ending {
		text-align: justify;
		page-break-inside: avoid;
	}
	.signature {
		text-align: right;
		font-family: helvetica;
	}
	.offer {
		page-break-inside: avoid;
		padding: 3pt 0;
	}
	.offers {
		padding: 0 30pt;
	}
	.offer .date_cell,
	.offer .title_cell {
		border-top: 0pt solid black;
	}
	.offer .text_cell {
		/*border-bottom: 1pt solid black;*/
	}
	.offer td.title_cell {
		font-weight: bold;
	}
	.offer td.date_cell {
		font-weight: bold;
		text-align: right;
		font-family: courier;
	}
	.offer .text_row {
		text-align: justify;
		font-size: 11pt;
		color: #444;
	}
	.offer .customer {
		text-align: left;
		font-style: italic;
	}
	.offer .price_row {
		font-size: 12pt;
		text-align: right;
		font-family: courier;
	}
</style>
<br/>
<p class="welcome">
	Dobrý deň,<br/><br/>
	<br/>
	&nbsp;&nbsp;&nbsp;&nbsp;sme z <strong>verejne</strong>.digital. Našim cieľom je zvyšovať transparentnosť, konkurenciu a kvalitu verejných obstarávaní využitím dát, ktoré poskytuje štát.
	Preto Vám v tomto liste zasielame niektoré z aktuálnych verejných obstarávaní, o ktorých si myslíme, že by Vás mohli zaujímať.
</p>
<p></p>

{foreach $data['notifications'] as $notification}
<table class="offer">
	<tr><td colspan="6">Nakoľko ste robili projekt</td></tr>
	<tr class="title_row"><td class="title_cell" colspan="5">{$notification['reason']['title']}</td><td class="date_cell"><img src="resources/date2.png" />{$notification['reason']['bulletin_day']}.{$notification['reason']['bulletin_month']}.{$notification['reason']['bulletin_year']}</td></tr>
	<tr class="text_row"><td colspan="6" class="text_cell">{$notification['reason']['text']}</td></tr>
	<tr class="price_row">
		<td colspan="3" class="customer"><span><img src="resources/place.png" />{$notification['reason']['customer']}</span></td>
		<td colspan="3">{if isset($notification['reason']['price'])}<span>Cena</span> {prettyfyPrice price=$notification['reason']['price']}{/if}</td>
	</tr>
	<tr><td></td></tr>
	<tr><td colspan="6">
		{if count($notification['offers']) > 1}
			Mohli by Vás zaujímať tieto výzvy
		{else}
			Mohla by Vás zaujímať táto výzva
		{/if}
	</td></tr>
</table>
{foreach $notification['offers'] as $offer}
<table class="offer">
	<tr class="title_row"><td class="title_cell" colspan="5">{$offer['title']}</td><td colspan="1" class="date_cell"><img src="resources/deadline.png" />{$offer['bulletin_day']}.{$offer['bulletin_month']}.{$offer['bulletin_year']}</td></tr>
	<tr class="text_row"><td colspan="6" class="text_cell">{$offer['text']}</td></tr>
	<tr class="price_row">
		<td colspan="3" class="customer"><span><img src="resources/place.png" />{$offer['customer']}</span></td>
		<td colspan="3">{if isset($offer['price'])}<span>Odhadovaná cena</span> {prettyfyPrice price=$offer['price']}{/if}</td>
	</tr>
</table>
<p></p>
{/foreach}
<p></p>
{/foreach}

<p class="ending">
	&nbsp;&nbsp;&nbsp;&nbsp;Veríme, že Vás aspoň jedno obstarávanie zaujalo. Pre získanie zoznamu všetkých aktuálnych obstarávaní odporúčame navštíviť <em>{$linkMore}</em>
	alebo oficiálnu stránku Úradu pre Verejné Obstarávania: <em>www.uvo.gov.sk</em>.
	
	<p class="signature">
	S pozdravom,<br/>
	<em>Tím <strong>verejne</strong>.digital</em></p>
</p>
