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
		page-break-inside: avoid;
	}
	.offer {
		page-break-inside: avoid;
		padding: 3pt 0;
	}
	.offer .date_cell {
		border-top: 0pt solid black;
		text-align: right;
	}
	.date {
		font-family: courier;
		font-weight: bold;
	}
	.offer .title_cell {
		border-top: 0pt solid black;
	}
	.offer .text_cell {
		/*border-bottom: 1pt solid black;*/
	}
	.offer td.title_cell {
		font-weight: bold;
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
	Dobrý deň {$companyName},<br/><br/>
	<br/>
	&nbsp;&nbsp;&nbsp;&nbsp;Sme z <strong>verejne</strong>.digital. Našim cieľom je zvyšovať kvalitu, konkurencu a transparentnosť verejných obstarávaní využitím dát, ktoré zverejňuje štát. Nakoľko ste už úspešne vyhrali verejné obstarávanie v minulosti, myslíme si, že by ste boli dobrý kandidát aj na podobné práve prebiehajúce verejné obstarávanie. Preto Vám v tomto liste zasielame niektoré z aktuálnych verejných obstarávaní, o ktorých si myslíme, že by Vás mohli zaujímať.
</p>
<p></p>

{foreach $data['notifications'] as $notification}
<table class="offer">
	<tr><td colspan="6">Nakoľko ste robili projekt</td></tr>
	<tr class="title_row"><td class="title_cell" colspan="5">{$notification['reason']['title']}</td>
		<td class="date_cell">
			{if isset($notification['reason']['bulletin_day'])}
				<img src="resources/date2.png" />
				<span class="date">{$notification['reason']['bulletin_day']}.{$notification['reason']['bulletin_month']}.{$notification['reason']['bulletin_year']}</span>
			{/if}
		</td>
	</tr>
	<tr class="text_row"><td colspan="6" class="text_cell">{$notification['reason']['text']}</td></tr>
	<tr class="price_row">
		<td colspan="3" class="customer">
			<span>
				<img src="resources/place.png" />{$notification['reason']['customer']}
			</span>
		</td>
		<td colspan="3">
			{if isset($notification['reason']['price'])}
				<span>Cena</span> {prettyfyPrice price=$notification['reason']['price']}
			{/if}
		</td>
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
	<tr class="title_row"><td class="title_cell" colspan="4">{$offer['title']}</td>
		<td colspan="2" class="date_cell">
			{if isset($offer['bulletin_day'])}
				Vyhlásené dňa:
				<img src="resources/date2.png" />
				<span class="date">{$offer['bulletin_day']}.{$offer['bulletin_month']}.{$offer['bulletin_year']}</span>
			{/if}
		</td>
	</tr>
	<tr class="text_row"><td colspan="6" class="text_cell">{$offer['text']}</td></tr>
	<tr class="price_row">
		<td colspan="3" class="customer">
			<span><img src="resources/place.png" />{$offer['customer']}</span>
		</td>
		<td colspan="3">
			{if isset($offer['price'])}
				<span>Vyhlásená cena</span> {prettyfyPrice price=$offer['price']}
			{/if}
		</td>
	</tr>
</table>
<p></p>
{/foreach}
<p></p>
{/foreach}

<p class="ending">
	&nbsp;&nbsp;&nbsp;&nbsp;Veríme, že Vás aspoň jedno obstarávanie zaujalo. Pre získanie zoznamu všetkých aktuálnych obstarávaní odporúčame navštíviť našu stránku: <em>obstaravania.verejne.digital</em> alebo oficiálnu stránku Úradu pre Verejné Obstarávania: <em>www.uvo.gov.sk</em>.
</p>

<p class="ending">
Ak máte ľubovoľné otázky, pripomienky, alebo si neželáte dostávať podobné notifikácie v budúcnosti, prosím kontaktuje nás na ľubovoľnú z nižšie uvedených adries.
</p>
	
<p class="signature">
	S pozdravom,<br/><br/><br/>

	<em>Tím <strong>verejne.digital</strong></em><br/>
	OZ Chcemvediet.sk<br/>
	Karpatské námestie 10A<br/>
	83106 Bratislava<br/>
	<br/>
	<i>facebook.com/verejne.digital</i><br/>
</p>
